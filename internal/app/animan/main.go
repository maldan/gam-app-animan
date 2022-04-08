package animan

import (
	"embed"
	"flag"
	"fmt"
	"github.com/maldan/gam-app-animan/internal/app/animan/api"
	"github.com/maldan/gam-app-animan/internal/app/animan/core"
	"github.com/maldan/go-rapi"
	"github.com/maldan/go-rapi/rapi_core"
	"github.com/maldan/go-rapi/rapi_file"
	"github.com/maldan/go-rapi/rapi_rest"
	"github.com/maldan/go-rapi/rapi_vfs"
)

func Start(frontFs embed.FS) {
	/*cmhp_s3.Start("s3.json")
	list := cmhp_s3.List("backup/gam-data/maldan-gam-app-worktime")
	for i, f := range list {
		// fmt.Printf("%v\n", f.Path)
		r, err := cmhp_s3.Read(f.Path)
		if err != nil {
			fmt.Printf("%v", err)
		}
		cmhp_file.WriteBin(fmt.Sprintf("backup/%v", f.Path), r)
		fmt.Printf("%v i %v\n", i, f.Path)
	}
	fmt.Printf("Done")*/
	// fmt.Printf("%v\n", len(list))

	// Server
	var host = flag.String("host", "127.0.0.1", "Server Hostname")
	var port = flag.Int("port", 16000, "Server Port")
	_ = flag.Int("clientPort", 8080, "Client Port")

	// Data
	var dataDir = flag.String("dataDir", "db", "Data Directory")
	_ = flag.String("appId", "id", "App id")
	flag.Parse()

	// Set
	core.DataDir = *dataDir

	// Test
	/*aa := api.AnimationApi{}.GetIndex(api.ArgsAnimationName{Name: "na"})
	cmhp_print.Print(aa)
	os.Exit(0)*/

	// Start server
	rapi.Start(rapi.Config{
		Host: fmt.Sprintf("%s:%d", *host, *port),
		Router: map[string]rapi_core.Handler{
			"/": rapi_vfs.VFSHandler{
				Root: "frontend/build",
				Fs:   frontFs,
			},
			"/api": rapi_rest.ApiHandler{
				Controller: map[string]interface{}{
					"main":      api.MainApi{},
					"animation": api.AnimationApi{},
					"object":    api.ObjectApi{},
					"audio":     api.AudioApi{},
					"pose":      api.PoseApi{},
				},
			},
			"/db": rapi_file.FileHandler{
				Root: core.DataDir,
			},
		},
		DbPath: core.DataDir,
	})
}
