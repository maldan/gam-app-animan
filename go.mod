module github.com/maldan/gam-app-animan

go 1.18

// replace github.com/maldan/go-restserver => ../../../go_lib/restserver
replace github.com/maldan/go-rapi => ../../../go_lib/rapi

replace github.com/maldan/go-cmhp => ../../../go_lib/cmhp

require (
	github.com/maldan/go-cmhp v0.0.20
	github.com/maldan/go-rapi v0.0.6
)

require (
	github.com/fatih/color v1.13.0 // indirect
	github.com/mattn/go-colorable v0.1.12 // indirect
	github.com/mattn/go-isatty v0.0.14 // indirect
	golang.org/x/sys v0.0.0-20210927094055-39ccf1dd6fa6 // indirect
)
