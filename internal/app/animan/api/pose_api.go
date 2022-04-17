package api

import (
	"encoding/json"
	"fmt"
	"github.com/maldan/gam-app-animan/internal/app/animan/core"
	"github.com/maldan/go-cmhp/cmhp_data"
	"github.com/maldan/go-cmhp/cmhp_file"
	"github.com/maldan/go-rapi/rapi_core"
)

type PoseApi struct {
}

func (r PoseApi) GetIndex(args ArgsName) core.AnimationFrame {
	stream, err := cmhp_data.FromFile(core.DataDir+"/pose/"+args.Name+"/pose.kp", true)
	rapi_core.FatalIfError(err)

	// Create frame
	frame := core.AnimationFrame{Keys: make([]core.AnimationKey, 0)}

	// Read keys of frame
	keysAmount := int(stream.ReadUint16())

	for i := 0; i < keysAmount; i++ {
		// Read key
		keyName := stream.ReadUTF8()
		keyType := stream.ReadUint8()
		key := core.AnimationKey{
			Name: keyName,
			Type: keyType,
		}

		// Float key
		if keyType == 1 {
			key.VFloat = stream.ReadFloat32()
		}

		// Vector2 key
		if keyType == 2 {
			key.VVector2.X = stream.ReadFloat32()
			key.VVector2.Y = stream.ReadFloat32()
		}

		// Vector3 key
		if keyType == 3 {
			key.VVector3.X = stream.ReadFloat32()
			key.VVector3.Y = stream.ReadFloat32()
			key.VVector3.Z = stream.ReadFloat32()
		}

		// Quaternion key
		if keyType == 4 {
			key.VQuaternion.X = stream.ReadFloat32()
			key.VQuaternion.Y = stream.ReadFloat32()
			key.VQuaternion.Z = stream.ReadFloat32()
			key.VQuaternion.W = stream.ReadFloat32()
		}

		frame.Keys = append(frame.Keys, key)
	}

	return frame
}

// GetInfo of audio files
func (r PoseApi) GetInfo(args ArgsResourceId) core.ResourceInfo {
	info, err := core.GetResourceInfoById(core.DataDir+"/pose", args.ResourceId, "pose", "kp")
	rapi_core.FatalIfError(err)
	return info

	/*obj := core.ResourceInfo{}

	// Get file list
	allFiles, _ := cmhp_file.ListAll(core.DataDir + "/pose")
	allFiles = cmhp_slice.Filter(allFiles, func(t cmhp_file.FileInfo) bool {
		return strings.Contains(t.FullPath, "info.json")
	})

	// Get wd
	wd, _ := os.Getwd()
	wd = strings.ReplaceAll(wd, "\\", "/")

	for _, file := range allFiles {
		info := core.ResourceInfo{}

		info.FilePath = strings.Replace(
			strings.Replace(strings.ReplaceAll(file.FullPath, "/info.json", "/pose.kp"), wd, "", 1),
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

	return obj*/
}

// GetList of audio files
func (r PoseApi) GetList() []core.ResourceInfo {
	return core.GetResourceList(core.DataDir+"/pose", "pose", "kp")

	/*list := make([]core.ResourceInfo, 0)

	fileList, _ := cmhp_file.ListAll(core.DataDir + "/pose")
	fileList = cmhp_slice.Filter(fileList, func(t cmhp_file.FileInfo) bool {
		return strings.Contains(t.Name, ".kp")
	})

	for _, file := range fileList {
		fileDir := strings.Replace(file.FullPath, "/pose.kp", "", 1)

		// Get file info
		clipInfo, err := core.GetResourceInfo(fileDir)
		if err != nil {
			core.UpdateResourceInfo(fileDir, "pose")
			clipInfo, err = core.GetResourceInfo(fileDir)
		}

		// Add to list
		list = append(list, clipInfo)
	}

	return list*/
}

func (r PoseApi) PutIndex(args struct {
	Name string `json:"name"`
	Pose string `json:"pose"`
}) core.ResourceInfo {
	// Parse data
	frame := core.AnimationFrame{}
	err := json.Unmarshal([]byte(args.Pose), &frame)
	rapi_core.FatalIfError(err)

	// Allocate stream
	stream := cmhp_data.Allocate(0, true)

	// Amount of keys
	stream.WriteUInt16(uint16(len(frame.Keys)))

	// Write each key
	for _, key := range frame.Keys {
		// Key name
		stream.WriteUTF8(key.Name)

		// Key type
		stream.WriteUInt8(key.Type)

		// Float key
		if key.Type == 1 {
			stream.WriteFloat32(key.VFloat)
		}

		// Vector2 key
		if key.Type == 2 {
			stream.WriteFloat32(key.VVector3.X)
			stream.WriteFloat32(key.VVector3.Y)
		}

		// Vector3 key
		if key.Type == 3 {
			stream.WriteFloat32(key.VVector3.X)
			stream.WriteFloat32(key.VVector3.Y)
			stream.WriteFloat32(key.VVector3.Z)
		}

		// Quaternion key
		if key.Type == 4 {
			stream.WriteFloat32(key.VQuaternion.X)
			stream.WriteFloat32(key.VQuaternion.Y)
			stream.WriteFloat32(key.VQuaternion.Z)
			stream.WriteFloat32(key.VQuaternion.W)
		}
	}

	// Write file
	err = cmhp_file.Write(fmt.Sprintf("%v/pose/%v/pose.kp", core.DataDir, args.Name), stream.Data)
	rapi_core.FatalIfError(err)

	// Update info
	core.UpdateResourceInfo(fmt.Sprintf("%v/pose/%v", core.DataDir, args.Name), "pose", "kp")

	// Get info
	info, err := core.GetResourceInfo(core.DataDir + "/pose/" + args.Name)
	rapi_core.FatalIfError(err)

	return info
}
