module github.com/maldan/gam-app-animan

go 1.18

// replace github.com/maldan/go-restserver => ../../../go_lib/restserver
replace github.com/maldan/go-rapi => ../../../go_lib/rapi
replace github.com/maldan/go-cmhp => ../../../go_lib/cmhp

require (
	github.com/maldan/go-cmhp v0.0.20
	github.com/maldan/go-rapi v0.0.6
)
