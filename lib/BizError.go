package lib

type BizError struct {
	ErrorCode    string
	ErrorMessage string
	Err          error
}

func (e *BizError) Error() string {
	return e.ErrorCode + " " + e.ErrorMessage + ": " + e.Err.Error()
}
