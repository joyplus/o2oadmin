package lib

import (
	b64 "encoding/base64"
	"encoding/json"
	"fmt"
	"github.com/astaxie/beego/httplib"
	"strings"
)

type ServerInfo struct {
	AccountSid   string
	AccountToken string
	AppId        string
	ServerIP     string
	ServerPort   string
	SoftVersion  string
}

type SmsData struct {
	To         string   `json:"to"`
	AppId      string   `json:"appId"`
	TemplateId string   `json:"templateId"`
	Datas      []string `json:"datas"`
}

func SendTemplateSMS(to string, datas []string, tempId string, serverInfo *ServerInfo) (result map[string]interface{}, err error) {

	smsData := new(SmsData)
	smsData.To = to
	smsData.AppId = serverInfo.AppId
	smsData.TemplateId = tempId
	smsData.Datas = datas
	body, err := json.Marshal(smsData)

	fmt.Printf(string(body))
	if err != nil {
		return nil, err
	}

	strCurrentTime := GetCurrentTime()
	sig := GetMd5String(strings.Join([]string{serverInfo.AccountSid, serverInfo.AccountToken, strCurrentTime}, ""))

	authStringOriginal := strings.Join([]string{serverInfo.AccountSid, ":", strCurrentTime}, "")

	authBase64 := b64.StdEncoding.EncodeToString([]byte(authStringOriginal))

	//$url="https://$this->ServerIP:$this->ServerPort/$this->SoftVersion/Accounts/$this->AccountSid/SMS/TemplateSMS?sig=$sig";

	requestUrl := strings.Join([]string{"https://" + serverInfo.ServerIP + ":" + serverInfo.ServerPort, serverInfo.SoftVersion, "Accounts", serverInfo.AccountSid, "SMS", "TemplateSMS"}, "/")
	requestUrl = requestUrl + "?sig=" + sig

	fmt.Println(requestUrl)
	req := httplib.Post(requestUrl)
	req.Header("Accept", "application/json")
	req.Header("Content-Type", "application/json")
	req.Header("charset", "utf-8")
	req.Header("Authorization", authBase64)

	req.Body(body)

	jsonStr, err := req.String()
	if err != nil {
		return nil, err
	}

	err = json.Unmarshal([]byte(jsonStr), &result)

	return result, err

}
