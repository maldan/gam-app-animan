package api

import (
	"github.com/maldan/gam-app-animan/internal/app/animan/core"
	"github.com/maldan/go-cmhp/cmhp_file"
	"github.com/maldan/go-rapi/rapi_core"
	"strings"
)

type PoseApi struct {
}

/*
func (r PoseApi) GetIndex(args ArgsAnimationName) core.AnimationFrame {
	stream, err := cmhp_data.FromFile(core.DataDir+"/pose/"+args.Name+".kp", true)
	rapi_core.FatalIfError(err)

	// Create frame
	pose := core.AnimationFrame{Keys: map[string]core.AnimationKey{}}

	// Read keys of frame
	keysAmount := int(stream.ReadUint16())

	for i := 0; i < keysAmount; i++ {
		// Read key
		keyName := stream.ReadUTF8()
		keyType := stream.ReadUint8()
		key := core.AnimationKey{}

		if keyType == 0 {
			// Read position
			x := stream.ReadFloat32()
			y := stream.ReadFloat32()
			z := stream.ReadFloat32()
			key.Position = core.Vector3{X: x, Y: y, Z: z}

			// Read rotation
			x = stream.ReadFloat32()
			y = stream.ReadFloat32()
			z = stream.ReadFloat32()
			w := stream.ReadFloat32()
			key.Rotation = core.Quaternion{X: x, Y: y, Z: z, W: w}

			// Read scale
			x = stream.ReadFloat32()
			y = stream.ReadFloat32()
			z = stream.ReadFloat32()
			key.Scale = core.Vector3{X: x, Y: y, Z: z}
		}

		// Set key
		pose.Keys[keyName] = key
	}

	return pose
}*/

func (r PoseApi) GetList() []string {
	out := make([]string, 0)
	fileList, err := cmhp_file.List(core.DataDir + "/pose")
	rapi_core.FatalIfError(err)

	for _, file := range fileList {
		out = append(out, strings.Replace(file.Name(), ".kp", "", 1))
	}

	return out
}

/*
func (r PoseApi) PostIndex(args struct {
	Name string `json:"name"`
	Data string `json:"data"`
}) {
	pose := core.AnimationFrame{}
	json.Unmarshal([]byte(args.Data), &pose)

	// Write animation data
	stream := cmhp_data.Allocate(0, true)

	// Amount of keys
	stream.WriteUInt16(uint16(len(pose.Keys)))

	// Write each key
	for keyName, keyValue := range pose.Keys {
		// Key name
		stream.WriteUTF8(keyName)

		// Key type
		stream.WriteUInt8(uint8(keyValue.Type))

		// Transform key
		if keyValue.Type == 0 {
			// Write position
			stream.WriteFloat32(keyValue.Position.X)
			stream.WriteFloat32(keyValue.Position.Y)
			stream.WriteFloat32(keyValue.Position.Z)

			// Write rotation
			stream.WriteFloat32(keyValue.Rotation.X)
			stream.WriteFloat32(keyValue.Rotation.Y)
			stream.WriteFloat32(keyValue.Rotation.Z)
			stream.WriteFloat32(keyValue.Rotation.W)

			// Write scale
			stream.WriteFloat32(keyValue.Scale.X)
			stream.WriteFloat32(keyValue.Scale.Y)
			stream.WriteFloat32(keyValue.Scale.Z)
		}

		// Blend shape key
		if keyValue.Type == 1 {
			stream.WriteFloat32(keyValue.Value)
		}
	}

	// Pose
	err := cmhp_file.Write(core.DataDir+"/pose/"+args.Name+".kp", stream.Data)
	rapi_core.FatalIfError(err)
}*/
