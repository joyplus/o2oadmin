package lib

type SysError struct {
	ErrorCode    string
	ErrorMessage string
	Err          error
}

func (e *SysError) Error() string {
	return e.ErrorCode + " " + e.ErrorMessage + ": " + e.Err.Error()
}
