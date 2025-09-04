package utils

import "testing"

func TestIsValidEmail(t *testing.T) {
	cases := []struct {
		input string
		want  bool
	}{
		{"test@example.com", true},
		{"usuario@dominio.pe", true},
		{"mal-email", false},
		{"otro@.com", false},
		{"", false},
	}
	for _, c := range cases {
		if got := IsValidEmail(c.input); got != c.want {
			t.Errorf("IsValidEmail(%q) = %v; want %v", c.input, got, c.want)
		}
	}
}

func TestIsStrongPassword(t *testing.T) {
	cases := []struct {
		input string
		want  bool
	}{
		{"Abcdef1!", true},
		{"12345678", false},
		{"abcdefgH", false},
		{"Abcdefgh", false},
		{"Abc1!", false},
	}
	for _, c := range cases {
		if got := IsStrongPassword(c.input); got != c.want {
			t.Errorf("IsStrongPassword(%q) = %v; want %v", c.input, got, c.want)
		}
	}
}

func TestIsValidName(t *testing.T) {
	cases := []struct {
		input    string
		min, max int
		want     bool
	}{
		{"Juan Pérez", 2, 50, true},
		{"A", 2, 50, false},
		{"NombreConMuchosCaracteresQueSuperaElLimite", 2, 20, false},
		{"José", 2, 50, true},
		{"Nombre123", 2, 50, false},
	}
	for _, c := range cases {
		if got := IsValidName(c.input, c.min, c.max); got != c.want {
			t.Errorf("IsValidName(%q, %d, %d) = %v; want %v", c.input, c.min, c.max, got, c.want)
		}
	}
}
