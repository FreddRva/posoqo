package handlers

import (
	"strconv"
	"sync"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/golang-jwt/jwt/v5"
)

// Mapa de conexiones por user_id y admin
var wsConns = struct {
	mu     sync.RWMutex
	users  map[int64]*websocket.Conn
	admins map[int64]*websocket.Conn
}{users: make(map[int64]*websocket.Conn), admins: make(map[int64]*websocket.Conn)}

// Handler para /ws
func WebSocketHandler(c *fiber.Ctx) error {
	if websocket.IsWebSocketUpgrade(c) {
		return c.Next()
	}
	return fiber.ErrUpgradeRequired
}

func WebSocketConn(c *websocket.Conn) {
	var userID int64
	var isAdmin bool
	claimsRaw := c.Locals("user")
	if claimsRaw != nil {
		claims := claimsRaw.(jwt.MapClaims)
		userID = int64(claims["id"].(float64))
		isAdmin = claims["role"] == "admin"
	}
	// Guardar conexión
	wsConns.mu.Lock()
	if isAdmin {
		wsConns.admins[userID] = c
	} else {
		wsConns.users[userID] = c
	}
	wsConns.mu.Unlock()
	defer func() {
		wsConns.mu.Lock()
		if isAdmin {
			delete(wsConns.admins, userID)
		} else {
			delete(wsConns.users, userID)
		}
		wsConns.mu.Unlock()
		c.Close()
	}()
	for {
		_, _, err := c.ReadMessage()
		if err != nil {
			break
		}
	}
}

// Enviar notificación a usuario específico
func NotifyUser(userID int64, message string) {
	wsConns.mu.RLock()
	conn, ok := wsConns.users[userID]
	wsConns.mu.RUnlock()
	if ok {
		conn.WriteMessage(websocket.TextMessage, []byte(message))
	}
}

// Enviar notificación a todos los admins conectados
func NotifyAdmins(message string) {
	wsConns.mu.RLock()
	for _, conn := range wsConns.admins {
		conn.WriteMessage(websocket.TextMessage, []byte(message))
	}
	wsConns.mu.RUnlock()
}

// Utilidad: notificar usuario y admins
func NotifyUserAndAdmins(userID int64, message string) {
	NotifyUser(userID, message)
	NotifyAdmins("Usuario " + strconv.FormatInt(userID, 10) + ": " + message)
}
