package api

import (
	"encoding/json"
	"fmt"
	"github.com/maldan/gam-app-animan/internal/app/animan/core"
	"github.com/maldan/go-cmhp/cmhp_crypto"
	"github.com/maldan/go-cmhp/cmhp_data"
	"github.com/maldan/go-cmhp/cmhp_file"
	"github.com/maldan/go-cmhp/cmhp_slice"
	"github.com/maldan/go-rapi/rapi_core"
	"os"
	"strings"
)

type ClipApi struct {
}

func WriteClipObjectList(stream *cmhp_data.ByteArray, objectList []core.ObjectInfo) {
	chunk := cmhp_data.Allocate(0, true)
	chunk.WriteUInt16(uint16(len(objectList))) // Amount of objects
	for _, obj := range objectList {
		chunk.WriteUTF8(obj.Id)
		chunk.WriteUTF8(obj.ResourceId)

		// Position
		chunk.WriteFloat32(obj.Position.X)
		chunk.WriteFloat32(obj.Position.Y)
		chunk.WriteFloat32(obj.Position.Z)

		// Rotation
		chunk.WriteFloat32(obj.Rotation.X)
		chunk.WriteFloat32(obj.Rotation.Y)
		chunk.WriteFloat32(obj.Rotation.Z)
		chunk.WriteFloat32(obj.Rotation.W)

		// Scale
		chunk.WriteFloat32(obj.Scale.X)
		chunk.WriteFloat32(obj.Scale.Y)
		chunk.WriteFloat32(obj.Scale.Z)
	}
	stream.WriteSection(core.ANIMATION_SECTION_MARKET, "OBJECT_LIST", chunk)
}

func WriteClipAnimationList(stream *cmhp_data.ByteArray, animationList []core.AnimationController) {
	chunk := cmhp_data.Allocate(0, true)
	chunk.WriteUInt16(uint16(len(animationList))) // Amount of animations

	for _, an := range animationList {
		chunk.WriteUTF8(an.ObjectId)                     // Id of object
		chunk.WriteUInt16(uint16(len(an.AnimationList))) // Amount of animation parts

		for _, part := range an.AnimationList {
			chunk.WriteUInt16(part.Offset) // Offset of part

			// Write animation data
			WriteAnimationFileInfo(chunk, part.Animation)
			WriteAnimationFrames(chunk, part.Animation)
			WriteEnd(chunk)
		}
	}
	stream.WriteSection(core.ANIMATION_SECTION_MARKET, "ANIMATION_LIST", chunk)
}

// GetList of audio files
func (r ClipApi) GetList() []core.ClipInfo {
	list := make([]core.ClipInfo, 0)

	fileList, _ := cmhp_file.ListAll(core.DataDir + "/clip")
	fileList = cmhp_slice.Filter(fileList, func(t cmhp_file.FileInfo) bool {
		return strings.Contains(t.Name, ".ac")
	})

	for _, file := range fileList {
		fileDir := strings.Replace(file.FullPath, "/clip.ac", "", 1)

		// Get file info
		clipInfo, err := r.GetResourceInfo(fileDir)
		if err != nil {
			r.UpdateInfo(fileDir)
			clipInfo, err = r.GetResourceInfo(fileDir)
		}

		// Add to list
		list = append(list, clipInfo)
	}

	return list
}

func (r ClipApi) GetInfo(args ArgsResourceId) core.ClipInfo {
	obj := core.ClipInfo{}

	allFiles, _ := cmhp_file.ListAll(core.DataDir + "/clip")
	allFiles = cmhp_slice.Filter(allFiles, func(t cmhp_file.FileInfo) bool {
		return strings.Contains(t.FullPath, "info.json")
	})
	wd, _ := os.Getwd()
	wd = strings.ReplaceAll(wd, "\\", "/")

	for _, file := range allFiles {
		info := core.ClipInfo{}

		info.ClipPath = strings.Replace(
			strings.Replace(strings.ReplaceAll(file.FullPath, "/info.json", "/clip.ac"), wd, "", 1),
			"/db",
			"data",
			1,
		)

		cmhp_file.ReadJSON(file.FullPath, &info)

		if info.ResourceId == args.ResourceId {
			return info
		}
	}

	rapi_core.Fatal(rapi_core.Error{Description: "File not found", Code: 404})

	return obj
}

func (r ClipApi) GetIndex(args ArgsName) core.Clip {
	stream, err := cmhp_data.FromFile(core.DataDir+"/clip/"+args.Name+"/clip.ac", true)
	rapi_core.FatalIfError(err)

	clip := core.Clip{
		Name:          args.Name,
		ObjectList:    make([]core.ObjectInfo, 0),
		AnimationList: make([]core.AnimationController, 0),
	}

	for {
		sectionName, section, err := stream.ReadSection(core.ANIMATION_SECTION_MARKET)
		rapi_core.FatalIfError(err)

		switch sectionName {
		case "OBJECT_LIST":
			amount := section.ReadUint16()
			for i := 0; i < int(amount); i++ {
				obj := core.ObjectInfo{}
				obj.Id = section.ReadUTF8()
				obj.ResourceId = section.ReadUTF8()

				// Position
				obj.Position.X = section.ReadFloat32()
				obj.Position.Y = section.ReadFloat32()
				obj.Position.Z = section.ReadFloat32()

				// Rotation
				obj.Rotation.X = section.ReadFloat32()
				obj.Rotation.Y = section.ReadFloat32()
				obj.Rotation.Z = section.ReadFloat32()
				obj.Rotation.W = section.ReadFloat32()

				// Scale
				obj.Scale.X = section.ReadFloat32()
				obj.Scale.Y = section.ReadFloat32()
				obj.Scale.Z = section.ReadFloat32()

				clip.ObjectList = append(clip.ObjectList, obj)
			}
			break
		case "ANIMATION_LIST":
			amount := section.ReadUint16() // Amount of total animations

			for i := 0; i < int(amount); i++ {
				controller := core.AnimationController{}
				controller.ObjectId = section.ReadUTF8() // UUID of object
				amountOfList := section.ReadUint16()     // Amount of animation parts

				for j := 0; j < int(amountOfList); j++ {
					part := core.AnimationPart{}
					part.Offset = section.ReadUint16()
					part.Animation = ReadAnimation(section)
					controller.AnimationList = append(controller.AnimationList, part)
				}

				clip.AnimationList = append(clip.AnimationList, controller)
			}
			break
		case "END":
			return clip
		default:
			fmt.Printf("Unknown section %v\n", sectionName)
			rapi_core.Fatal(rapi_core.Error{Description: fmt.Sprintf("Unknown section %v\n", sectionName)})
			break
		}

		if stream.IsEnd() {
			break
		}
	}

	return clip
}

// UpdateInfo write some info
func (r ClipApi) UpdateInfo(pathDir string) {
	// Open file info
	info := core.ClipInfo{}
	cmhp_file.ReadJSON(pathDir+"/info.json", &info)

	// Calculate name
	nameTuple := strings.Split(pathDir, "/")
	info.Name = nameTuple[len(nameTuple)-1]
	info.ResourceId = cmhp_crypto.Sha1(info.Name)

	// Get working directory
	wd, _ := os.Getwd()
	wd = strings.ReplaceAll(wd, "\\", "/")

	// Calculate category
	categoryTuple := strings.Split(strings.Replace(pathDir, wd+"/db/clip/", "", 1), "/")
	info.Category = strings.Join(categoryTuple[0:len(categoryTuple)-1], "/")

	// Audio path
	info.ClipPath = strings.Replace(strings.Replace(pathDir, wd, "", 1), "/db", "db", 1) + "/clip.ac"

	// Write back
	cmhp_file.Write(pathDir+"/info.json", &info)
}

// GetResourceInfo get some info
func (r ClipApi) GetResourceInfo(pathDir string) (core.ClipInfo, error) {
	// Open file info
	info := core.ClipInfo{}
	err := cmhp_file.ReadJSON(pathDir+"/info.json", &info)
	if err != nil {
		return info, err
	}
	return info, nil
}

func (r ClipApi) PutIndex(args struct {
	Clip string `json:"clip"`
}) core.ClipInfo {
	clip := core.Clip{}
	json.Unmarshal([]byte(args.Clip), &clip)

	// Write clip data
	stream := cmhp_data.Allocate(0, true)
	WriteClipObjectList(stream, clip.ObjectList)
	WriteClipAnimationList(stream, clip.AnimationList)
	WriteEnd(stream)

	// Clip
	err := cmhp_file.Write(core.DataDir+"/clip/"+clip.Name+"/clip.ac", stream.Data)
	rapi_core.FatalIfError(err)

	// Update info
	wd, _ := os.Getwd()
	wd = strings.ReplaceAll(wd, "\\", "/")
	r.UpdateInfo(wd + "/" + core.DataDir + "/clip/" + clip.Name)

	// Get info
	info, err := r.GetResourceInfo(wd + "/" + core.DataDir + "/clip/" + clip.Name)
	rapi_core.FatalIfError(err)

	return info
}
