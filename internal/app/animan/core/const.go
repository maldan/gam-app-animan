package core

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
	Repeat    uint16            `json:"repeat"`
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

type AudioPart struct {
	ObjectId   string  `json:"objectId"`
	ResourceId string  `json:"resourceId"`
	Offset     int     `json:"offset"`
	Repeat     int     `json:"repeat"`
	Volume     float64 `json:"volume"`
}

/*type ClipInfo struct {
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
}*/

type ResourceInfo struct {
	ResourceId  string `json:"resourceId"`
	Name        string `json:"name"`
	Category    string `json:"category"`
	FilePath    string `json:"filePath"`
	PreviewPath string `json:"previewPath"`
}

type Clip struct {
	Name          string                `json:"name"`
	ObjectList    []ObjectInfo          `json:"objectList"`
	AnimationList []AnimationController `json:"animationList"`
	AudioList     []AudioPart           `json:"audioList"`
}

const ANIMATION_SECTION_MARKET uint32 = 1296649793

var DataDir = ""
