package api

import "github.com/maldan/go-rapi/rapi_core"

type ArgsEmpty struct {
}

type ArgsObject struct {
	Name  string         `json:"name"`
	Model rapi_core.File `json:"model"`
}
