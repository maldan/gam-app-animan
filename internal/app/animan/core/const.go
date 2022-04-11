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
	Animation AnimationSequence `json:"animation"`
}

type AnimationController struct {
	ObjectId      string          `json:"objectId"`
	AnimationList []AnimationPart `json:"animationList"`
}

type ObjectInfo struct {
	Id          string     `json:"id"`
	ResourceId  string     `json:"resourceId"`
	Name        string     `json:"name"`
	Category    string     `json:"category"`
	PreviewPath string     `json:"previewPath"`
	ModelPath   string     `json:"modelPath"`
	Position    Vector3    `json:"position"`
	Rotation    Quaternion `json:"rotation"`
	Scale       Vector3    `json:"scale"`
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

type Clip struct {
	Name          string                `json:"name"`
	ObjectList    []ObjectInfo          `json:"objectList"`
	AnimationList []AnimationController `json:"animationList"`
}

const ANIMATION_SECTION_MARKET uint32 = 1296649793

var DataDir = ""
