package core

import (
	"github.com/maldan/go-cmhp/cmhp_crypto"
	"github.com/maldan/go-cmhp/cmhp_file"
	"os"
	"strings"
)

type Vector3 struct {
	X float32 `json:"x"`
	Y float32 `json:"y"`
	Z float32 `json:"z"`
}

type Quaternion struct {
	X float32 `json:"x"`
	Y float32 `json:"y"`
	Z float32 `json:"z"`
	W float32 `json:"w"`
}

type AnimationKey struct {
	Name        string     `json:"name"`
	Type        uint8      `json:"type"`
	VBool       bool       `json:"vBool"`
	VFloat      float32    `json:"vFloat"`
	VVector2    Vector3    `json:"vVector2"`
	VVector3    Vector3    `json:"vVector3"`
	VQuaternion Quaternion `json:"vQuaternion"`
}

type AnimationFrame struct {
	Keys []AnimationKey `json:"keys"`
}

type AnimationSequence struct {
	Version    uint8            `json:"version"`
	FrameCount uint32           `json:"frameCount"`
	FPS        uint8            `json:"fps"`
	Name       string           `json:"name"`
	Frames     []AnimationFrame `json:"frames"`
}

type AnimationPart struct {
	Offset    uint16            `json:"offset"`
	Animation AnimationSequence `json:"animation"`
}

type AnimationController struct {
	ObjectId      string          `json:"objectId"`
	AnimationList []AnimationPart `json:"animationList"`
}

type ObjectInfo struct {
	Id          string `json:"id"`
	ResourceId  string `json:"resourceId"`
	Name        string `json:"name"`
	Category    string `json:"category"`
	FilePath    string `json:"filePath"`
	PreviewPath string `json:"previewPath"`

	Position Vector3    `json:"position"`
	Rotation Quaternion `json:"rotation"`
	Scale    Vector3    `json:"scale"`
}

type AudioInfo struct {
	ResourceId string `json:"resourceId"`
	Name       string `json:"name"`
	Category   string `json:"category"`
	AudioPath  string `json:"audioPath"`
}

type ClipInfo struct {
	ResourceId string `json:"resourceId"`
	Name       string `json:"name"`
	Category   string `json:"category"`
	ClipPath   string `json:"clipPath"`
}

type AnimationInfo struct {
	ResourceId string `json:"resourceId"`
	Name       string `json:"name"`
	Category   string `json:"category"`
	FilePath   string `json:"filePath"`
}

type ResourceInfo struct {
	ResourceId string `json:"resourceId"`
	Name       string `json:"name"`
	Category   string `json:"category"`
	FilePath   string `json:"filePath"`
}

type Clip struct {
	Name          string                `json:"name"`
	ObjectList    []ObjectInfo          `json:"objectList"`
	AnimationList []AnimationController `json:"animationList"`
}

const ANIMATION_SECTION_MARKET uint32 = 1296649793

var DataDir = ""

// UpdateResourceInfo write some info
func UpdateResourceInfo(pathDir string, kind string) {
	// Open file info
	info := ResourceInfo{}
	cmhp_file.ReadJSON(pathDir+"/info.json", &info)

	// Calculate name
	nameTuple := strings.Split(pathDir, "/")
	info.Name = nameTuple[len(nameTuple)-1]
	info.ResourceId = cmhp_crypto.Sha1(info.Name)

	// Get working directory
	wd, _ := os.Getwd()
	wd = strings.ReplaceAll(wd, "\\", "/")

	if kind == "pose" {
		// Calculate category
		categoryTuple := strings.Split(strings.Replace(wd+"/"+pathDir, wd+"/db/pose/", "", 1), "/")
		info.Category = strings.Join(categoryTuple[0:len(categoryTuple)-1], "/")

		// File path
		info.FilePath = strings.Replace(strings.Replace(pathDir, wd, "", 1), "/db", "db", 1) + "/pose.kp"
	}

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
