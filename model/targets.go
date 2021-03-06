package model

import (
	"net/http"

	"github.com/labstack/echo"
)

func GetTargets(c echo.Context, questionnaireID int) ([]string, error) {
	targets := []string{}
	if err := db.Select(&targets, "SELECT user_traqid FROM targets WHERE questionnaire_id = ?", questionnaireID); err != nil {
		c.Logger().Error(err)
		return nil, echo.NewHTTPError(http.StatusInternalServerError)
	}
	return targets, nil
}

func InsertTargets(c echo.Context, questionnaireID int, targets []string) error {
	for _, v := range targets {
		if _, err := db.Exec(
			"INSERT INTO targets (questionnaire_id, user_traqid) VALUES (?, ?)",
			questionnaireID, v); err != nil {
			c.Logger().Error(err)
			return echo.NewHTTPError(http.StatusInternalServerError)
		}
	}
	return nil
}

func DeleteTargets(c echo.Context, questionnaireID int) error {
	if _, err := db.Exec(
		"DELETE from targets WHERE questionnaire_id = ?",
		questionnaireID); err != nil {
		c.Logger().Error(err)
		return echo.NewHTTPError(http.StatusInternalServerError)
	}
	return nil
}

// 自分またはtraPが含まれているアンケートのID
func GetTargettedQuestionnaireID(c echo.Context) ([]int, error) {
	targetedQuestionnaireID := []int{}
	if err := db.Select(&targetedQuestionnaireID,
		`SELECT DISTINCT questionnaire_id FROM targets WHERE user_traqid = ? OR user_traqid = 'traP'`,
		GetUserID(c)); err != nil {
		c.Logger().Error(err)
		return nil, echo.NewHTTPError(http.StatusInternalServerError)
	}
	return targetedQuestionnaireID, nil
}

// 指定したtraQIDまたはtraPが含まれているアンケートのID
func GetTargettedQuestionnaireIDBytraQID(c echo.Context, traQID string) ([]int, error) {
	targetedQuestionnaireID := []int{}
	if err := db.Select(&targetedQuestionnaireID,
		`SELECT DISTINCT questionnaire_id FROM targets WHERE user_traqid = ? OR user_traqid = 'traP'`,
		traQID); err != nil {
		c.Logger().Error(err)
		return nil, echo.NewHTTPError(http.StatusInternalServerError)
	}
	return targetedQuestionnaireID, nil
}
