package model

import (
	"net/http"

	"github.com/labstack/echo"
)

func GetAdministrators(c echo.Context, questionnaireID int) ([]string, error) {
	administrators := []string{}
	if err := db.Select(&administrators, "SELECT user_traqid FROM administrators WHERE questionnaire_id = ?", questionnaireID); err != nil {
		c.Logger().Error(err)
		return nil, echo.NewHTTPError(http.StatusInternalServerError)
	}
	return administrators, nil
}

func InsertAdministrators(c echo.Context, questionnaireID int, administrators []string) error {
	for _, v := range administrators {
		if _, err := db.Exec(
			"INSERT INTO administrators (questionnaire_id, user_traqid) VALUES (?, ?)",
			questionnaireID, v); err != nil {
			c.Logger().Error(err)
			return echo.NewHTTPError(http.StatusInternalServerError)
		}
	}
	return nil
}

func DeleteAdministrators(c echo.Context, questionnaireID int) error {
	if _, err := db.Exec(
		"DELETE from administrators WHERE questionnaire_id = ?",
		questionnaireID); err != nil {
		c.Logger().Error(err)
		return echo.NewHTTPError(http.StatusInternalServerError)
	}
	return nil
}

func GetAdminQuestionnaires(c echo.Context, user string) ([]int, error) {
	questionnaireID := []int{}
	if err := db.Select(&questionnaireID,
		`SELECT DISTINCT questionnaire_id FROM administrators WHERE user_traqid = ? OR user_traqid = 'traP'`,
		user); err != nil {
		c.Logger().Error(err)
		return nil, echo.NewHTTPError(http.StatusInternalServerError)
	}
	return questionnaireID, nil
}

// 自分がadminなら(true, nil)
func CheckAdmin(c echo.Context, questionnaireID int) (bool, error) {
	user := GetUserID(c)
	administrators, err := GetAdministrators(c, questionnaireID)
	if err != nil {
		c.Logger().Error(err)
		return false, err
	}

	found := false
	for _, admin := range administrators {
		if admin == user || admin == "traP" {
			found = true
			break
		}
	}
	if !found {
		return false, nil
	}
	return true, nil
}
