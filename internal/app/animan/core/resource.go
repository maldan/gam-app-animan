package core

import (
	"errors"
	"github.com/maldan/go-cmhp/cmhp_crypto"
	"github.com/maldan/go-cmhp/cmhp_file"
	"github.com/maldan/go-cmhp/cmhp_slice"
	"os"
	"strings"
)

// UpdateResourceInfo write some info
func UpdateResourceInfo(pathDir string, kind string, ext string) {
	// Open file info
	info := ResourceInfo{}
	cmhp_file.ReadJSON(pathDir+"/info.json", &info)

	// Calculate name
	nameTuple := strings.Split(pathDir, "/")
	info.Name = nameTuple[len(nameTuple)-1]
	if info.ResourceId == "" {
		info.ResourceId = cmhp_crypto.UID(24)
	}
	// info.ResourceId = cmhp_crypto.Sha1(info.Name)

	// Get working directory
	wd, _ := os.Getwd()
	wd = strings.ReplaceAll(wd, "\\", "/")

	// Calculate category
	categoryTuple := strings.Split(strings.Replace(pathDir, wd+"/db/"+kind+"/", "", 1), "/")
	info.Category = strings.Join(categoryTuple[0:len(categoryTuple)-1], "/")

	// File path
	info.FilePath = strings.Replace(strings.Replace(pathDir, wd, "", 1), "/db", "db", 1) + "/" + kind + "." + ext

	// Write back
	cmhp_file.Write(pathDir+"/info.json", &info)
}

// GetResourceInfo get some info
func GetResourceInfo(pathDir string) (ResourceInfo, error) {
	// Open file info
	info := ResourceInfo{}
	err := cmhp_file.ReadJSON(pathDir+"/info.json", &info)
	if err != nil {
		return info, err
	}
	return info, nil
}

// GetResourceInfoById get some info
func GetResourceInfoById(pathDir string, resourceId string, kind string, ext string) (ResourceInfo, error) {
	obj := ResourceInfo{}

	allFiles, _ := cmhp_file.ListAll(pathDir)
	allFiles = cmhp_slice.Filter(allFiles, func(t cmhp_file.FileInfo) bool {
		return strings.Contains(t.FullPath, "info.json")
	})
	wd, _ := os.Getwd()
	wd = strings.ReplaceAll(wd, "\\", "/")

	for _, file := range allFiles {
		info := ResourceInfo{}

		info.FilePath = strings.Replace(
			strings.Replace(strings.ReplaceAll(file.FullPath, "/info.json", "/"+kind+"."+ext), wd, "", 1),
			"/db",
			"data",
			1,
		)

		cmhp_file.ReadJSON(file.FullPath, &info)

		if info.ResourceId == resourceId {
			return info, nil
		}
	}

	return obj, errors.New("file not found")
}

// GetResourceList list of all resources
func GetResourceList(pathDir string, kind string, ext string) []ResourceInfo {
	list := make([]ResourceInfo, 0)

	fileList, _ := cmhp_file.ListAll(pathDir)
	fileList = cmhp_slice.Filter(fileList, func(t cmhp_file.FileInfo) bool {
		return strings.Contains(t.Name, "."+ext)
	})

	for _, file := range fileList {
		fileDir := strings.Replace(file.FullPath, "/"+kind+"."+ext, "", 1)

		// Get file info
		fileInfo, err := GetResourceInfo(fileDir)
		if err != nil {
			UpdateResourceInfo(fileDir, kind, ext)
			fileInfo, err = GetResourceInfo(fileDir)
		}

		// Add to list
		list = append(list, fileInfo)
	}

	return list
}
