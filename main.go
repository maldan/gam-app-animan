package main

import (
	"embed"

	helloworld "github.com/maldan/gam-app-animan/internal/app/animan"
)

//go:embed frontend/build/*
var frontFs embed.FS

func main() {
	helloworld.Start(frontFs) //
}
