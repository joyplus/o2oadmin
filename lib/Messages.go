package lib

var Messages map[string]string

func init() {
	Messages = make(map[string]string)

	Messages["200001"] = "验证码错误。"
	Messages["200002"] = "验证码发送失败。"
	Messages["200003"] = "手机号码错误。"
	Messages["200004"] = "缺少数据字典代码。"
	Messages["200005"] = "缺少分类代码。"
	Messages["200006"] = "缺少订单ID。"
	Messages["200007"] = "无数据。"
}
