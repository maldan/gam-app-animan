package api

import "github.com/maldan/go-rapi/rapi_core"

type ArgsEmpty struct {
}

type ArgsObject struct {
	Name  string         `json:"name"`
	Model rapi_core.File `json:"model"`
}

type ArgsObjectPreview struct {
	Name    string         `json:"name"`
	Type    string         `json:"type"`
	Preview rapi_core.File `json:"preview"`
}
