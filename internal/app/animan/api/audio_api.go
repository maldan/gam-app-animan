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

func (r AudioApi) GetIndex(args struct {
	UUID string `json:"uuid"`
}) core.ObjectInfo {
	obj := core.ObjectInfo{}

	allFiles, _ := cmhp_file.ListAll(core.DataDir + "/object")
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

func (r AudioApi) GetList() []core.AudioInfo {
	list := make([]core.AudioInfo, 0)

	fileList, _ := cmhp_file.ListAll(core.DataDir + "/audio")
	wd, _ := os.Getwd()
	wd = strings.ReplaceAll(wd, "\\", "/")

	for _, file := range fileList {
		// Get file info
		fileInfo := core.AudioInfo{}
		cmhp_file.ReadJSON(strings.Replace(file.FullPath, "/sound.mp3", "info.json", 1), &fileInfo)

		// Calculate name
		nameTuple := strings.Split(strings.Replace(file.FullPath, "/sound.mp3", "", 1), "/")
		name := nameTuple[len(nameTuple)-1]

		// Calculate category
		categoryTuple := strings.Split(strings.Replace(file.Dir, wd+"/db/audio/", "", 1), "/")
		category := strings.Join(categoryTuple[0:len(categoryTuple)-1], "/")

		// Add to list
		list = append(list, core.AudioInfo{
			UUID:      fileInfo.UUID,
			Name:      name,
			Category:  category,
			AudioPath: strings.Replace(strings.Replace(file.FullPath, wd, "", 1), "/db", "data", 1),
		})
	}
	/*for _, file := range fileList {

	}*/
	/*if args.Category == "" {
		return list
	}

	fileList, _ := cmhp_file.List(core.DataDir + "/audio/" + args.Category)

	for _, file := range fileList {
		if !file.IsDir() {
			continue
		}

		// Get file info
		fileInfo := core.AudioInfo{}
		cmhp_file.ReadJSON(core.DataDir+"/audio/"+args.Category+"/"+file.Name()+"/info.json", &fileInfo)

		// Add to list
		list = append(list, core.AudioInfo{
			UUID:      fileInfo.UUID,
			Name:      file.Name(),
			Category:  args.Category,
			AudioPath: "data/audio/" + args.Category + "/" + file.Name() + "/sound.mp3",
		})
	}*/

	return list
}

func (r AudioApi) PutIndex(args struct {
	Name     string         `json:"name"`
	Category string         `json:"category"`
	Audio    rapi_core.File `json:"audio"`
}) {
	if args.Name == "" {
		rapi_core.Fatal(rapi_core.Error{Description: "Incorrect Name"})
	}
	err := cmhp_file.Write(fmt.Sprintf("%v/audio/%v/%v/sound.mp3", core.DataDir, args.Category, args.Name), args.Audio.Data)
	rapi_core.FatalIfError(err)
}
