package api

import (
	"fmt"
	"github.com/maldan/gam-app-animan/internal/app/animan/core"
	"github.com/maldan/go-cmhp/cmhp_file"
	"github.com/maldan/go-cmhp/cmhp_slice"
	"github.com/maldan/go-rapi/rapi_core"
	"os"
	"strings"
)

type AudioApi struct {
}

// GetIndex get info about audio file by uuid
func (r AudioApi) GetIndex(args struct {
	UUID string `json:"uuid"`
}) core.ObjectInfo {
	obj := core.ObjectInfo{}

	allFiles, _ := cmhp_file.ListAll(core.DataDir + "/audio")
	allFiles = cmhp_slice.Filter(allFiles, func(t cmhp_file.FileInfo) bool {
		return strings.Contains(t.FullPath, "info.json")
	})
	wd, _ := os.Getwd()
	wd = strings.ReplaceAll(wd, "\\", "/")

	for _, file := range allFiles {
		info := core.ObjectInfo{}
		info.PreviewPath = strings.Replace(
			strings.Replace(strings.ReplaceAll(file.FullPath, "/info.json", "/preview.jpg"), wd, "", 1),
			"/db",
			"data",
			1,
		)
		info.ModelPath = strings.Replace(
			strings.Replace(strings.ReplaceAll(file.FullPath, "/info.json", "/model.glb"), wd, "", 1),
			"/db",
			"data",
			1,
		)

		cmhp_file.ReadJSON(file.FullPath, &info)

		if info.UUID == args.UUID {
			return info
		}
	}

	rapi_core.Fatal(rapi_core.Error{Description: "File not found", Code: 404})

	return obj
}

// GetList of audio files
func (r AudioApi) GetList() []core.AudioInfo {
	list := make([]core.AudioInfo, 0)

	fileList, _ := cmhp_file.ListAll(core.DataDir + "/audio")
	fileList = cmhp_slice.Filter(fileList, func(t cmhp_file.FileInfo) bool {
		return strings.Contains(t.Name, ".mp3")
	})

	for _, file := range fileList {
		fileDir := strings.Replace(file.FullPath, "/sound.mp3", "", 1)

		// Get file info
		audioInfo, err := r.GetAudioInfo(fileDir)
		if err != nil {
			r.UpdateAudioInfo(fileDir)
			audioInfo, err = r.GetAudioInfo(fileDir)
		}

		// Add to list
		list = append(list, audioInfo)
	}

	return list
}

// GetAudioInfo get some info
func (r AudioApi) GetAudioInfo(pathDir string) (core.AudioInfo, error) {
	// Open file info
	info := core.AudioInfo{}
	err := cmhp_file.ReadJSON(pathDir+"/info.json", &info)
	if err != nil {
		return info, err
	}
	return info, nil
}

// UpdateAudioInfo write some info
func (r AudioApi) UpdateAudioInfo(pathDir string) {
	// Open file info
	info := core.AudioInfo{}
	cmhp_file.ReadJSON(pathDir+"/info.json", &info)
	info.UUID, _ = cmhp_file.HashSha1(pathDir + "/sound.mp3")

	// Calculate name
	nameTuple := strings.Split(pathDir, "/")
	info.Name = nameTuple[len(nameTuple)-1]

	// Get working directory
	wd, _ := os.Getwd()
	wd = strings.ReplaceAll(wd, "\\", "/")

	// Calculate category
	categoryTuple := strings.Split(strings.Replace(pathDir, wd+"/db/audio/", "", 1), "/")
	info.Category = strings.Join(categoryTuple[0:len(categoryTuple)-1], "/")

	// Audio path
	info.AudioPath = strings.Replace(strings.Replace(pathDir, wd, "", 1), "/db", "db", 1) + "/sound.mp3"

	// Write back
	cmhp_file.Write(pathDir+"/info.json", &info)
}

// PutIndex write audio file
func (r AudioApi) PutIndex(args struct {
	Name  string         `json:"name"`
	Audio rapi_core.File `json:"audio"`
}) {
	if args.Name == "" {
		rapi_core.Fatal(rapi_core.Error{Description: "Incorrect Name"})
	}
	err := cmhp_file.Write(fmt.Sprintf("%v/audio/%v/sound.mp3", core.DataDir, args.Name), args.Audio.Data)
	rapi_core.FatalIfError(err)

	r.UpdateAudioInfo(fmt.Sprintf("%v/audio/%v", core.DataDir, args.Name))
}
