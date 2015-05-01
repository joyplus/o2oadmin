package main

import (
	"github.com/astaxie/beego"
	//lib "o2oadmin/lib"
	_ "o2oadmin/routers"
)

//var redisx *lib.RedisxCache

func main() {

	//initCache()

	beego.Run()

}

//func initCache() {

//	redisx = lib.NewRedisxCache()
//	err := redisx.StartAndGC(`{"conn":":6379"}`)
//	if err != nil {
//		panic(err)
//	}
//}
