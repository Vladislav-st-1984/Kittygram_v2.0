import React from "react";
import { useHistory } from "react-router-dom";

import { updateCard } from "../../utils/api";
import { colorsList, getBase64, colorsNames } from "../../utils/constants";

import returnIcon from "../../images/left.svg";
import addImgIcon from "../../images/image.svg";
import removeIcon from "../../images/trash.svg";

import { ButtonSecondary } from "../ui/button-secondary/button-secondary";
import { Input } from "../ui/input/input";
import { ButtonForm } from "../ui/button-form/button-form";
import { Select } from "../ui/select/select";
import { ColorsBox } from "../ui/colors-box/colors-box";

import styles from "./edit-card-page.module.css";

export const EditCardPage = ({ data, setData, extraClass = "" }) => {
  const [currentColor, setCurrentColor] = React.useState("#FFFFFF");
  const [card, setCard] = React.useState({});
  const [achievements, setAchievements] = React.useState("");
  const [currentFileName, setCurrentFileName] = React.useState("");
  const [previewUrl, setPreviewUrl] = React.useState("");
  const [errorName, setErrorName] = React.useState("");
  const [errorAge, setErrorAge] = React.useState("");

  const history = useHistory();

  React.useEffect(() => {
    if (data.id) {
      setCard(data);
      setCurrentColor(colorsNames[data.color]);
      let resString = "";
      data.achievements.forEach((item) => {
        resString
          ? (resString += `, ${item.achievement_name}`)
          : (resString = item.achievement_name);
      });
      setAchievements(resString);
    }
  }, [data, setData]);

  const onChangeInput = (e) => {
    if (e.target.name === "image") {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      setCurrentFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
      return;
    }
    setCard({
      ...card,
      [e.target.name]: e.target.value,
    });
  };

  const handleReturn = () => {
    history.goBack();
  };

  const handleRemoveImg = () => {
    setCard({ ...card, image: null });
    setPreviewUrl("");
    setCurrentFileName("");
  };

  const handleResponse = (res) => {
    if (typeof res.name === "object") {
      setErrorName("Поле с именем является обязательным");
    } else if (typeof res.birth_year === "object") {
      setErrorAge("Поле с годом рождения является обязательным");
    }
  };

  const handleSubmit = () => {
    errorAge && setErrorAge("");
    errorName && setErrorName("");

    const totalCard = {};
    const photo = document.querySelector('input[type="file"]').files[0];
    if (data.name !== card.name) {
      totalCard["name"] = card.name;
    }
    if (data.color !== card.color) {
      totalCard["color"] = card.color;
    }
    if (data.birth_year !== card.birth_year) {
      totalCard["birth_year"] = card.birth_year;
    }
    if (data.image !== card.image && card.image === null) {
      totalCard["image"] = card.image;
    }
    if (
      JSON.stringify(data.achievements) !== JSON.stringify(card.achievements)
    ) {
      totalCard["achievements"] = card.achievements;
    }

    if (photo) {
      getBase64(photo).then((data) => {
        totalCard["image"] = data;
        updateCard(totalCard, card.id)
          .then((res) => {
            if (res && res.id) {
              history.replace({ pathname: `/cats/${res.id}` });
            }
          })
          .catch(handleResponse);
      });
    } else {
      updateCard(totalCard, card.id)
        .then((res) => {
          if (res && res.id) {
            history.replace({ pathname: `/cats/${res.id}` });
          }
        })
        .catch(handleResponse);
    }
  };

  return (
    <div className={`${styles.content} ${extraClass}`}>
      <h2 className="text text_type_h2 text_color_primary mt-25 mb-9">
        Редактировать кота
      </h2>
      <ButtonSecondary
        extraClass={styles.return_btn_mobile}
        icon={returnIcon}
        onClick={handleReturn}
      />
      <div className={styles.container}>
        {previewUrl ? (
          <label htmlFor="image" className={styles.img_box}>
            <img
              className={styles.current_img}
              src={previewUrl}
              alt="Превью котика."
            />
            <ButtonSecondary
              extraClass={styles.remove_btn}
              icon={removeIcon}
              onClick={(e) => {
                e.preventDefault();
                handleRemoveImg();
              }}
            />
          </label>
        ) : !currentFileName && card.image ? (
          <div className={styles.img_box}>
            <img
              className={styles.current_img}
              src={card.image_url}
              alt="Фото котика."
            />
            <ButtonSecondary
              extraClass={styles.remove_btn}
              icon={removeIcon}
              onClick={handleRemoveImg}
            />
          </div>
        ) : (
          <label htmlFor="image" className={styles.img_box}>
            <img
              className={styles.img}
              src={addImgIcon}
              alt="Добавить фото котика."
            />
            <p className="text text_type_medium-16 text_color_primary">
              {currentFileName
                ? currentFileName
                : "Загрузите фото в формате JPG"}
            </p>
          </label>
        )}
        <input
          type="file"
          accept="image/*"
          className={styles.file_input}
          name="image"
          id="image"
          onChange={onChangeInput}
        />
        <Input
          type="text"
          placeholder="Имя кота"
          name="name"
          defaultValue={card.name}
          onChange={onChangeInput}
          error={errorName}
        />
        <Input
          type="text"
          placeholder="Год рождения"
          name="birth_year"
          defaultValue={card.birth_year}
          onChange={onChangeInput}
          error={errorAge}
        />
        <ColorsBox
          colorsList={colorsList}
          currentColor={currentColor}
          setCurrentColor={setCurrentColor}
          card={card}
          setCard={setCard}
        />
        <Select card={card} setCard={setCard} userAchievements={achievements} />
        <ButtonForm
          extraClass={styles.submit_btn}
          text="Сохранить"
          onClick={handleSubmit}
        />
        <ButtonSecondary
          extraClass={styles.return_btn}
          icon={returnIcon}
          onClick={handleReturn}
        />
      </div>
    </div>
  );
};
