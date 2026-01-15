import { useCallback, useEffect, useRef, useState } from "react";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MdDelete } from "react-icons/md";
import {
  Circle,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../../shared/api/api";
import { useActsStore } from "../../shared/stores/actsStore";
import { useAuthStore } from "../../shared/stores/authStore";
import { useSequelStore } from "../../shared/stores/sequelStore";
import { ActFormat, ActType, SelectionMethods } from "../../shared/types/act";
import styles from "./CreateAct.module.css";
import StreamHost from "./components/StreamHost";
import { useCreateAct } from "./hooks/useCreateAct";
import { useCreateSequel } from "./hooks/useCreateSequel";

export default function CreateAct() {
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");
  const [actType, setActType] = useState(ActType.SINGLE);
  const [formatType, setFormatType] = useState(ActFormat.SINGLE);
  const [settingsType, setSettingsType] = useState("option1");
  const [heroMethod, setHeroMethod] = useState(SelectionMethods.VOTING);
  const [navigatorMethod, setNavigatorMethod] = useState(
    SelectionMethods.VOTING,
  );
  const [biddingTime, setBiddingTime] = useState(5);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sequelCoverPreview, setSequelCoverPreview] = useState(null);

  // Состояние для формы сиквела
  const [sequelTitle, setSequelTitle] = useState("");
  const [sequelEpisodes, setSequelEpisodes] = useState("");
  const [sequelPhoto, setSequelPhoto] = useState(null);

  // Состояние для созданного act
  const [createdAct, setCreatedAct] = useState(null);
  const [showStream, setShowStream] = useState(false);

  // Состояние для модального окна задач
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Состояние для карты и координат
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    location,
    routeDestination,
    routeCoordinates,
    routePoints,
    setRouteDestination,
    setRouteCoordinates,
    addRoutePoint,
    removeRoutePoint,
    clearRoute,
    clearRoutePoints,
  } = useAuthStore();

  // Используем store для надежного хранения tasks
  const {
    createActFormState,
    setCreateActTasks,
    addCreateActTask,
    updateCreateActTask,
    deleteCreateActTask,
    clearCreateActForm,
  } = useActsStore();

  const tasks = createActFormState.tasks;
  const {
    selectedSequelId,
    selectedSequel,
    selectedIntroId,
    selectedIntro,
    selectedOutroId,
    selectedOutro,
    selectedMusicIds,
    selectedMusic,
    clearSelectedSequel,
    clearSelectedIntro,
    clearSelectedOutro,
    clearSelectedMusic,
  } = useSequelStore();
  const { createAct, loading, error, success, resetState } = useCreateAct();
  const {
    createSequel,
    loading: sequelLoading,
    error: sequelError,
    success: sequelSuccess,
    resetState: resetSequelState,
  } = useCreateSequel();

  // Отладка изменений selectedSequelId из стора
  useEffect(() => {
    console.log("selectedSequelId from store changed:", selectedSequelId);
    console.log("selectedSequel from store:", selectedSequel);
    console.log("selectedIntroId from store:", selectedIntroId);
    console.log("selectedIntro from store:", selectedIntro);
    console.log("selectedOutroId from store:", selectedOutroId);
    console.log("selectedOutro from store:", selectedOutro);
    console.log("selectedMusicIds from store:", selectedMusicIds);
    console.log("selectedMusic from store:", selectedMusic);
  }, [
    selectedSequelId,
    selectedSequel,
    selectedIntroId,
    selectedIntro,
    selectedOutroId,
    selectedOutro,
    selectedMusicIds,
    selectedMusic,
  ]);

  // Утилитарная функция для конвертации base64 в File
  const base64ToFile = useCallback((base64, fileName = "image.png") => {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
  }, []);

  // Функции для работы с задачами
  const openTasksModal = async () => {
    console.log("openTasksModal called, createdAct:", createdAct);
    setIsTasksModalOpen(true);

    // Если акт уже создан, загружаем задачи с сервера
    if (createdAct?.id) {
      await fetchTasks();
    }
  };

  const closeTasksModal = () => {
    setIsTasksModalOpen(false);
    setNewTaskTitle("");
  };

  const fetchTasks = async () => {
    if (!createdAct?.id) return;

    try {
      setLoadingTasks(true);
      const response = await api.get(`/act/${createdAct.id}/tasks`);
      setCreateActTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoadingTasks(false);
    }
  };

  const createTask = async () => {
    if (!newTaskTitle.trim()) {
      toast.error("Task title cannot be empty");
      return;
    }

    // Если акт еще не создан, добавляем задачу в store
    if (!createdAct?.id) {
      const localTask = {
        id: `temp-${Date.now()}`,
        title: newTaskTitle,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        local: true, // флаг для отличия локальных задач
      };
      addCreateActTask(localTask);
      setNewTaskTitle("");
      toast.success("Task added (will be saved when act is created)");
      return;
    }

    // Если акт создан, отправляем на сервер
    try {
      const response = await api.post(`/act/${createdAct.id}/tasks`, {
        title: newTaskTitle,
      });
      addCreateActTask(response.data);
      setNewTaskTitle("");
      toast.success("Task created successfully");
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    }
  };

  const toggleTaskCompletion = async (taskId, currentStatus) => {
    // Если задача локальная (не сохранена на сервере), обновляем в store
    const task = tasks.find((t) => t.id === taskId);
    if (task?.local) {
      updateCreateActTask(taskId, {
        isCompleted: !currentStatus,
        completedAt: !currentStatus ? new Date().toISOString() : null,
      });
      toast.success(!currentStatus ? "Task completed!" : "Task reopened");
      return;
    }

    if (!createdAct?.id) return;

    try {
      const response = await api.patch(
        `/act/${createdAct.id}/tasks/${taskId}`,
        {
          isCompleted: !currentStatus,
        },
      );
      updateCreateActTask(taskId, response.data);
      toast.success(
        response.data.isCompleted ? "Task completed!" : "Task reopened",
      );
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  const deleteTask = async (taskId) => {
    // Если задача локальная, просто удаляем из store
    const task = tasks.find((t) => t.id === taskId);
    if (task?.local) {
      deleteCreateActTask(taskId);
      toast.success("Task deleted");
      return;
    }

    if (!createdAct?.id) return;

    try {
      await api.delete(`/act/${createdAct.id}/tasks/${taskId}`);
      deleteCreateActTask(taskId);
      toast.success("Task deleted");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  // Сохранение локальных задач на сервер после создания акта
  const saveLocalTasksToServer = async (actId) => {
    const localTasks = tasks.filter((task) => task.local);

    if (localTasks.length === 0) {
      console.log("No local tasks to save");
      return;
    }

    console.log("Saving local tasks to server:", localTasks);
    console.log("Act ID:", actId);

    try {
      // Сохраняем каждую локальную задачу на сервер
      const savedTasks = await Promise.all(
        localTasks.map(async (task) => {
          try {
            console.log("Sending task to server:", task.title);
            const response = await api.post(`/act/${actId}/tasks`, {
              title: task.title,
            });
            console.log("Task saved successfully:", response.data);
            return { oldId: task.id, newTask: response.data };
          } catch (error) {
            console.error("Error saving task:", task.title, error);
            console.error(
              "Error details:",
              error.response?.data || error.message,
            );
            return null;
          }
        }),
      );

      // Обновляем состояние в store, заменяя локальные задачи на сохраненные
      const savedTasksFiltered = savedTasks.filter((t) => t !== null);

      if (savedTasksFiltered.length > 0) {
        // Удаляем старые локальные задачи
        savedTasksFiltered.forEach(({ oldId }) => {
          deleteCreateActTask(oldId);
        });

        // Добавляем новые задачи с сервера
        savedTasksFiltered.forEach(({ newTask }) => {
          addCreateActTask(newTask);
        });

        toast.success(
          `${savedTasksFiltered.length} task(s) saved successfully`,
        );
      }
    } catch (error) {
      console.error("Error saving local tasks:", error);
      toast.error("Some tasks could not be saved");
    }
  };

  // Функции для сохранения и восстановления состояния формы
  const saveFormState = () => {
    const formState = {
      title,
      actType,
      formatType,
      settingsType,
      heroMethod,
      navigatorMethod,
      biddingTime,
      imagePreview,
      // selectedSequelId управляется через стор, не сохраняем в localStorage
      timestamp: Date.now(),
    };
    localStorage.setItem("createActFormState", JSON.stringify(formState));
  };

  const restoreFormState = useCallback(() => {
    try {
      const savedState = localStorage.getItem("createActFormState");
      console.log("Restoring form state, savedState:", savedState);
      if (savedState) {
        const formState = JSON.parse(savedState);
        console.log("Parsed form state:", formState);
        // Проверяем, что данные не старше 30 минут
        if (Date.now() - formState.timestamp < 30 * 60 * 1000) {
          console.log(
            "Restoring form state from localStorage (excluding selectedSequelId, managed by store)",
          );
          setTitle(formState.title || "");
          setActType(formState.actType || ActType.SINGLE);
          setFormatType(formState.formatType || ActFormat.SINGLE);
          setSettingsType(formState.settingsType || "option1");
          setHeroMethod(formState.heroMethod || SelectionMethods.VOTING);
          setNavigatorMethod(
            formState.navigatorMethod || SelectionMethods.VOTING,
          );
          setBiddingTime(formState.biddingTime || 5);
          setImagePreview(formState.imagePreview || null);

          // Восстанавливаем файл из base64 если он есть
          if (formState.imagePreview) {
            try {
              const restoredFile = base64ToFile(
                formState.imagePreview,
                "restored-image.png",
              );
              setSelectedFile(restoredFile);
              console.log("Restored file from base64:", restoredFile);
            } catch (error) {
              console.error("Error restoring file from base64:", error);
            }
          }

          // selectedSequelId теперь управляется через стор
        } else {
          console.log("Saved form state is too old, not restoring");
        }
      } else {
        console.log("No saved form state found");
      }
    } catch (error) {
      console.error("Error restoring form state:", error);
    }
  }, [base64ToFile]);

  // Восстанавливаем состояние формы при загрузке компонента
  useEffect(() => {
    restoreFormState();
  }, [restoreFormState]);

  // Сохраняем состояние формы при каждом изменении
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveFormState();
    }, 500); // Дебаунс 500мс

    return () => clearTimeout(timeoutId);
  });

  const handleTimeChange = (direction) => {
    if (isAnimating) return;

    let newTime;
    if (direction === "increase") {
      newTime = Math.min(20, biddingTime + 5);
    } else {
      newTime = Math.max(5, biddingTime - 5);
    }

    if (newTime === biddingTime) return;

    setIsAnimating(true);
    setBiddingTime(newTime);

    setTimeout(() => setIsAnimating(false), 400);
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setImagePreview(null);
    }
  };

  const handleCreateAct = async () => {
    // Валидация
    if (!title.trim()) {
      alert("Please enter a title for your act");
      return;
    }

    if (!isAuthenticated) {
      alert("You must be logged in to create an act");
      navigate("/login");
      return;
    }

    // Подготавливаем данные для отправки
    console.log("Selected sequel ID before creating act:", selectedSequelId);
    console.log("Selected intro ID before creating act:", selectedIntroId);
    console.log("Selected outro ID before creating act:", selectedOutroId);
    console.log("Selected music IDs before creating act:", selectedMusicIds);
    console.log("Location from store:", location);
    console.log("Route destination from store:", routeDestination);
    console.log("Route coordinates from store:", routeCoordinates);
    console.log(
      "Will add destination coordinates:",
      routeDestination ? true : false,
    );

    // Формируем массив точек маршрута: начальная точка (order: 0) + выбранные точки
    const formattedRoutePoints = [];
    
    // Добавляем начальную точку с order: 0 если есть геолокация
    if (location) {
      formattedRoutePoints.push({
        latitude: location.latitude,
        longitude: location.longitude,
        order: 0,
      });
    }
    
    // Добавляем остальные точки маршрута со сдвигом order на +1
    if (routePoints && routePoints.length > 0) {
      routePoints.forEach((point) => {
        formattedRoutePoints.push({
          latitude: point.latitude,
          longitude: point.longitude,
          order: point.order + 1, // Сдвигаем order на +1, так как 0 - это начальная точка
        });
      });
    }

    const actData = {
      title: title.trim(),
      type: actType,
      format: formatType,
      heroMethods: heroMethod,
      navigatorMethods: navigatorMethod,
      biddingTime: new Date(Date.now() + biddingTime * 60 * 1000).toISOString(), // Добавляем время в минутах к текущему времени
      photo: selectedFile,
      musicIds: selectedMusicIds.length > 0 ? selectedMusicIds : [], // Всегда отправляем массив, пустой если ничего не выбрано
      ...(selectedSequelId !== null &&
        selectedSequelId !== undefined && { sequelId: selectedSequelId }), // Добавляем sequelId если он выбран
      ...(selectedIntroId !== null &&
        selectedIntroId !== undefined && { introId: selectedIntroId }), // Добавляем introId если выбрано
      ...(selectedOutroId !== null &&
        selectedOutroId !== undefined && { outroId: selectedOutroId }), // Добавляем outroId если выбрано
      ...(location && {
        startLatitude: location.latitude,
        startLongitude: location.longitude,
      }), // Добавляем стартовую позицию стримера из геолокации (для обратной совместимости)
      ...(routeDestination && {
        destinationLatitude: routeDestination.latitude,
        destinationLongitude: routeDestination.longitude,
      }), // Добавляем точку назначения если выбрана метка на карте (для обратной совместимости)
      ...(formattedRoutePoints.length > 0 && {
        routePoints: formattedRoutePoints,
      }), // Добавляем массив точек маршрута
    };

    console.log("Creating act with data:", actData);
    console.log("Act data includes coordinates:", {
      hasStartCoordinates: !!(location?.latitude && location?.longitude),
      hasDestinationCoordinates: !!(
        routeDestination?.latitude && routeDestination?.longitude
      ),
    });

    const result = await createAct(actData);

    if (result) {
      console.log("Act created successfully:", result);
      console.log("result.actId:", result.actId);

      // Очищаем сохраненное состояние формы
      localStorage.removeItem("createActFormState");

      // Очищаем выбранные элементы из стора
      clearSelectedSequel();
      clearSelectedIntro();
      clearSelectedOutro();
      clearSelectedMusic();

      console.log("Tasks before saving to server:", tasks);

      // Сохраняем данные созданного act
      const newActId = result.actId || result.id;
      console.log("Setting createdAct with id:", newActId);

      setCreatedAct({
        id: newActId,
        title: title.trim(),
      });

      // Сохраняем локальные задачи на сервер
      await saveLocalTasksToServer(newActId);

      // Показываем компонент стрима
      setShowStream(true);
    }
  };

  const handleStopStream = () => {
    setShowStream(false);
    setCreatedAct(null);
    clearRoute(); // Очищаем маршрут из стора
    // Очищаем tasks из store после завершения стрима
    clearCreateActForm();
    // Перенаправляем на страницу актов
    navigate("/acts");
  };

  // Если показываем стрим, рендерим StreamHost
  if (showStream && createdAct) {
    return (
      <StreamHost
        actId={createdAct.id}
        actTitle={createdAct.title}
        onStopStream={handleStopStream}
        startLocation={location}
        destinationLocation={routeDestination}
        routeCoordinates={routeCoordinates}
      />
    );
  }

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleActType = (type) => {
    setActType(type);
  };

  const handleFormatType = (type) => {
    setFormatType(type);
  };

  const handleSettingsType = (type) => {
    setSettingsType(type);
  };

  const handleHeroMethod = (method) => {
    setHeroMethod(method);
  };

  const handleNavigatorMethod = (method) => {
    setNavigatorMethod(method);
  };

  const handleGoBack = () => {
    navigate("/acts");
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Сбрасываем состояния при закрытии
    setSequelTitle("");
    setSequelEpisodes("");
    setSequelPhoto(null);
    setSequelCoverPreview(null);
    resetSequelState();
  };

  const handleSequelCoverChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setSequelPhoto(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSequelCoverPreview(ev.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSequelPhoto(null);
      setSequelCoverPreview(null);
    }
  };

  const handleCreateSequel = async (e) => {
    e.preventDefault();

    // Валидация
    if (!sequelTitle.trim()) {
      alert("Please enter a sequel title");
      return;
    }

    if (!sequelEpisodes.trim() || isNaN(parseInt(sequelEpisodes))) {
      alert("Please enter a valid episode number");
      return;
    }

    if (!sequelPhoto) {
      alert("Please upload a sequel cover");
      return;
    }

    const sequelData = {
      title: sequelTitle.trim(),
      episodes: parseInt(sequelEpisodes),
      photo: sequelPhoto,
    };

    const result = await createSequel(sequelData);

    if (result) {
      // Успешное создание сиквела
      toast.success("Sequel created successfully!");
      closeModal();
      // Сбрасываем форму
      setSequelTitle("");
      setSequelEpisodes("");
      setSequelPhoto(null);
      setSequelCoverPreview(null);
      resetSequelState();
    }
  };

  const ModalStripe = () => {
    return (
      <svg
        width="297"
        height="2"
        viewBox="0 0 297 2"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0 1H297" stroke="#3ABAFF" stroke-opacity="0.5" />
      </svg>
    );
  };

  return (
    <div className={styles.glass}>
      <div className={styles.header}>
        <div className={styles.name}>
          <img
            src="/icons/back_arrowV2.svg"
            alt="back_arrow"
            style={{ cursor: "pointer" }}
            onClick={handleGoBack}
          />
          <h1>Create ACT</h1>
        </div>
      </div>

      <div className="stripe2"></div>
      <div className={styles.content}>
        <div className={styles.block}>
          <p>Act Title</p>
          <input
            type="text"
            placeholder="Act Title"
            className={styles.ActTitle}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className={styles.block}>
          <p>Act Gallery</p>
          <div className={styles.fileRow}>
            <input
              type="text"
              readOnly
              value={" "}
              placeholder="No file chosen"
              className={styles.fileDisplay}
              style={
                imagePreview
                  ? {
                      backgroundImage: `url(${imagePreview})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      color: "#fff",
                    }
                  : undefined
              }
            />
            <button
              type="button"
              className={styles.browseBtn}
              onClick={openFileDialog}
            >
              Browse
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className={styles.hiddenFileInput}
            />
          </div>
        </div>
        <div className={styles.block}>
          <p>Sequel?</p>

          <div className={styles.fileRow}>
            <button
              type="button"
              className={styles.browseBtn}
              onClick={openModal}
            >
              Create Sequel
            </button>
            <button
              type="button"
              className={styles.browseBtn}
              onClick={() => navigate("/scene-control-sequel-select")}
            >
              Add to existing
            </button>
          </div>
        </div>
        <div className={styles.block}>
          <p>Act type</p>
          <div className={styles.fileRow}>
            <button
              type="button"
              className={
                actType === ActType.SINGLE
                  ? `${styles.typeBtn} ${styles.active}`
                  : styles.typeBtn
              }
              onClick={() => handleActType(ActType.SINGLE)}
            >
              <img src="/icons/singleHero.svg" alt="" />
              Single Hero
            </button>
            <button
              type="button"
              className={
                actType === ActType.MULTI
                  ? `${styles.typeBtn} ${styles.active}`
                  : styles.typeBtn
              }
              onClick={() => handleActType(ActType.MULTI)}
            >
              <img src="/icons/multiHero.svg" alt="" />
              Multi Hero
            </button>
          </div>
        </div>
        <div className={styles.block}>
          <p>Stream format</p>
          <div className={styles.fileRow}>
            <button
              type="button"
              className={
                formatType === ActFormat.SINGLE
                  ? `${styles.typeBtn} ${styles.active}`
                  : styles.typeBtn
              }
              onClick={() => handleFormatType(ActFormat.SINGLE)}
            >
              Single
            </button>
            <button
              type="button"
              className={
                formatType === ActFormat.SEVERAL
                  ? `${styles.typeBtn} ${styles.active}`
                  : styles.typeBtn
              }
              onClick={() => handleFormatType(ActFormat.SEVERAL)}
            >
              Several feed
            </button>
          </div>
        </div>
        <div className={styles.block}>
          <div className={styles.fileColumn}>
            <p>Hero Selection Methods</p>
            <div className={styles.btnRow}>
              <button
                type="button"
                className={
                  heroMethod === SelectionMethods.VOTING
                    ? `${styles.selectBtn} ${styles.selectBtnActive}`
                    : styles.selectBtn
                }
                onClick={() => handleHeroMethod(SelectionMethods.VOTING)}
              >
                <img src="/icons/voting.svg" alt="voting" />
                Voting
              </button>
              <button
                type="button"
                className={
                  heroMethod === SelectionMethods.BIDDING
                    ? `${styles.selectBtn} ${styles.selectBtnActive}`
                    : styles.selectBtn
                }
                style={{ paddingBottom: "7px" }}
                onClick={() => handleHeroMethod(SelectionMethods.BIDDING)}
              >
                <img src="/icons/hummer.svg" alt="voting" />
                Bidding
              </button>
              <button
                type="button"
                className={
                  heroMethod === SelectionMethods.MANUAL
                    ? `${styles.selectBtn} ${styles.selectBtnActive}`
                    : styles.selectBtn
                }
                onClick={() => handleHeroMethod(SelectionMethods.MANUAL)}
              >
                <img src="/icons/manual.svg" alt="voting" />
                Manual
              </button>
            </div>
          </div>
        </div>
        <div className={styles.block}>
          <div className={styles.fileColumn}>
            <p>Navigator Selection Methods</p>
            <div className={styles.btnRow}>
              <button
                type="button"
                className={
                  navigatorMethod === SelectionMethods.VOTING
                    ? `${styles.selectBtn} ${styles.selectBtnActive}`
                    : styles.selectBtn
                }
                onClick={() => handleNavigatorMethod(SelectionMethods.VOTING)}
              >
                <img src="/icons/voting.svg" alt="voting" />
                Voting
              </button>
              <button
                type="button"
                className={
                  navigatorMethod === SelectionMethods.BIDDING
                    ? `${styles.selectBtn} ${styles.selectBtnActive}`
                    : styles.selectBtn
                }
                style={{ paddingBottom: "7px" }}
                onClick={() => handleNavigatorMethod(SelectionMethods.BIDDING)}
              >
                <img src="/icons/hummer.svg" alt="voting" />
                Bidding
              </button>
              <button
                type="button"
                className={
                  navigatorMethod === SelectionMethods.MANUAL
                    ? `${styles.selectBtn} ${styles.selectBtnActive}`
                    : styles.selectBtn
                }
                onClick={() => handleNavigatorMethod(SelectionMethods.MANUAL)}
              >
                <img src="/icons/manual.svg" alt="voting" />
                Manual
              </button>
            </div>
          </div>
        </div>
        <div className={styles.block}>
          <p>Bidding Time</p>
          <div className={styles.row}>
            <svg
              width="7"
              height="13"
              viewBox="0 0 7 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                cursor: biddingTime <= 5 ? "not-allowed" : "pointer",
                opacity: biddingTime <= 5 ? 0.5 : 1,
              }}
              onClick={() => biddingTime > 5 && handleTimeChange("decrease")}
            >
              <path
                d="M6.73232 0.282864C6.90372 0.464036 7 0.709725 7 0.965903C7 1.22208 6.90372 1.46777 6.73232 1.64894L2.2068 6.43119L6.73232 11.2134C6.89886 11.3956 6.99101 11.6397 6.98893 11.893C6.98684 12.1463 6.89069 12.3886 6.72118 12.5677C6.55168 12.7469 6.32237 12.8485 6.08266 12.8507C5.84295 12.8529 5.612 12.7555 5.43958 12.5795L0.267679 7.11423C0.0962845 6.93305 2.50216e-07 6.68737 2.40631e-07 6.43119C2.31046e-07 6.17501 0.0962844 5.92932 0.267679 5.74815L5.43958 0.282864C5.61102 0.101746 5.84352 -2.98403e-07 6.08595 -3.10783e-07C6.32837 -3.23163e-07 6.56087 0.101746 6.73232 0.282864Z"
                fill={biddingTime <= 5 ? "#999" : "white"}
              />
            </svg>
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                height: "20px",
                width: "60px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span key={biddingTime}>{biddingTime} mins</span>
              {isAnimating && (
                <span
                  style={{
                    position: "absolute",
                    transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                    transform: "translateX(60px) scale(0.9)",
                    opacity: 0,
                    color: "white",
                    animation: "slideInHorizontal 0.4s ease-out forwards",
                  }}
                >
                  {biddingTime} mins
                </span>
              )}
            </div>
            <svg
              width="7"
              height="13"
              viewBox="0 0 7 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                cursor: biddingTime >= 20 ? "not-allowed" : "pointer",
                opacity: biddingTime >= 20 ? 0.5 : 1,
              }}
              onClick={() => biddingTime < 20 && handleTimeChange("increase")}
            >
              <path
                d="M0.26768 12.5687C0.0962849 12.3875 4.84082e-07 12.1418 4.86697e-07 11.8857C4.89312e-07 11.6295 0.0962849 11.3838 0.26768 11.2026L4.7932 6.42037L0.26768 1.63813C0.101143 1.45592 0.00899136 1.21188 0.0110747 0.958567C0.0131575 0.705255 0.109308 0.462943 0.278817 0.283818C0.448325 0.104693 0.677631 0.00308982 0.917343 0.00088874C1.15706 -0.00131234 1.388 0.0960664 1.56042 0.272051L6.73232 5.73734C6.90372 5.91851 7 6.1642 7 6.42037C7 6.67655 6.90372 6.92224 6.73232 7.10341L1.56042 12.5687C1.38898 12.7498 1.15648 12.8516 0.914052 12.8516C0.671627 12.8516 0.439126 12.7498 0.26768 12.5687Z"
                fill={biddingTime >= 20 ? "#999" : "white"}
              />
            </svg>
          </div>
        </div>
        <div className={styles.block}>
          <p>Waypoints/Tasks</p>
          <button
            type="button"
            className={styles.typeBtn}
            onClick={openTasksModal}
          >
            <img src="/icons/planet.svg" alt="" />
            Setup
          </button>
        </div>
        <div className={styles.block}>
          <p>Map</p>
          <button
            type="button"
            className={styles.typeBtn}
            onClick={() => setIsMapModalOpen(true)}
          >
            <img src="/icons/planet.svg" alt="" />
            {routePoints.length > 0 
              ? `Route (${routePoints.length} ${routePoints.length === 1 ? 'point' : 'points'})` 
              : "Add Route"}
          </button>
        </div>
        <div className={styles.block}>
          <p>Privacy settings</p>
          <div className={styles.fileRow}>
            <button
              type="button"
              className={
                settingsType === "option1"
                  ? `${styles.typeBtn} ${styles.active}`
                  : styles.typeBtn
              }
              onClick={() => handleSettingsType("option1")}
            >
              <img src="/icons/singleHero.svg" alt="" />
              Option 1
            </button>
            <button
              type="button"
              className={
                settingsType === "option2"
                  ? `${styles.typeBtn} ${styles.active}`
                  : styles.typeBtn
              }
              onClick={() => handleSettingsType("option2")}
            >
              <img src="/icons/multiHero.svg" alt="" />
              Option 2
            </button>
          </div>
        </div>
        <div className={styles.block}>
          <div className={styles.fileColumn}>
            <p>Scene Control</p>
            <button
              className={styles.controlBtn}
              onClick={() => navigate("/scene-control-intro")}
            >
              Tap to Open Control panel
            </button>
          </div>
        </div>
      </div>
      <div className={styles.btnContainer}>
        <button
          type="button"
          className={styles.createBtn}
          onClick={handleCreateAct}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className={styles.errorOverlay} onClick={() => resetState()}>
          <div
            className={styles.errorModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.errorHeader}>
              <h3>Unable to Create Act</h3>
            </div>
            <div className={styles.errorContent}>
              <div className={styles.errorDescription}>
                Please check the following:
              </div>
              <ul className={styles.errorList}>
                {error.split("\n").map((line, index) => (
                  <li key={index} className={styles.errorItem}>
                    {line}
                  </li>
                ))}
              </ul>
              <div className={styles.errorActions}>
                <button
                  className={styles.errorButton}
                  onClick={() => resetState()}
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Показываем успех */}
      {success && (
        <div className={styles.successContainer}>
          <div className={styles.successIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle
                cx="10"
                cy="10"
                r="9"
                stroke="white"
                strokeWidth="2"
                fill="rgba(255, 255, 255, 0.2)"
              />
              <path
                d="M6 10L9 13L14 7"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className={styles.successMessage}>
            Act created successfully! Redirecting...
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Create Sequel</h2>
              <ModalStripe />
            </div>
            <div className={styles.modalContent}>
              <form className={styles.sequelForm} onSubmit={handleCreateSequel}>
                <div className={styles.inputBlock}>
                  <label htmlFor="title">Sequel title</label>
                  <input
                    type="text"
                    id="title"
                    placeholder="Sequel title"
                    value={sequelTitle}
                    onChange={(e) => setSequelTitle(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.inputBlock}>
                  <label htmlFor="episode">Number of Episode</label>
                  <input
                    type="number"
                    id="episode"
                    placeholder="Number of Episode"
                    value={sequelEpisodes}
                    onChange={(e) => setSequelEpisodes(e.target.value)}
                    min="1"
                    required
                  />
                </div>

                <div className={styles.inputBlock}>
                  <label htmlFor="cover">Sequel Cover</label>
                  <div className={styles.coverUpload}>
                    <input
                      type="file"
                      id="cover"
                      accept="image/*"
                      onChange={handleSequelCoverChange}
                      className={styles.hiddenFileInput}
                      required
                    />
                    <div
                      className={styles.coverPreview}
                      onClick={() => document.getElementById("cover").click()}
                      style={
                        sequelCoverPreview
                          ? {
                              backgroundImage: `url(${sequelCoverPreview})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              backgroundRepeat: "no-repeat",
                            }
                          : undefined
                      }
                    >
                      {!sequelCoverPreview && (
                        <div className={styles.uploadPlaceholder}>
                          <span>+</span>
                          <p>Upload Cover</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Показываем ошибки создания сиквела */}
                {sequelError && (
                  <div
                    style={{
                      color: "red",
                      textAlign: "center",
                      marginBottom: "10px",
                    }}
                  >
                    Error: {sequelError}
                  </div>
                )}

                {/* Показываем успех создания сиквела */}
                {sequelSuccess && (
                  <div
                    style={{
                      color: "green",
                      textAlign: "center",
                      marginBottom: "10px",
                    }}
                  >
                    Sequel created successfully!
                  </div>
                )}

                <div className={styles.btnContainer}>
                  <button type="submit" disabled={sequelLoading}>
                    {sequelLoading ? "Creating..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={sequelLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tasks Modal */}
      {isTasksModalOpen && (
        <div className={styles.modalOverlay} onClick={closeTasksModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Stream Tasks</h2>
              <ModalStripe />
            </div>

            <div className={styles.modalContent}>
              <div className={styles.tasksContainer}>
                {/* New Task Input */}
                <div className={styles.newTaskForm}>
                  <input
                    type="text"
                    placeholder="Enter new task..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        createTask();
                      }
                    }}
                    className={styles.taskInput}
                  />
                  <button
                    onClick={createTask}
                    className={styles.addTaskButton}
                    disabled={!newTaskTitle.trim()}
                  >
                    Add Task
                  </button>
                </div>

                {/* Tasks List */}
                <div className={styles.tasksList}>
                  {loadingTasks ? (
                    <div className={styles.loadingTasks}>Loading tasks...</div>
                  ) : tasks.length === 0 ? (
                    <div className={styles.noTasks}>
                      No tasks yet. Create your first task above!
                    </div>
                  ) : (
                    tasks.map((task) => (
                      <div key={task.id} className={styles.taskItem}>
                        <div className={styles.taskContent}>
                          <span className={styles.taskTitle}>{task.title}</span>
                        </div>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className={styles.deleteTaskButton}
                          aria-label="Delete task"
                        >
                          <MdDelete size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {isMapModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsMapModalOpen(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Select Location</h2>
              <ModalStripe />
            </div>

            <div className={styles.modalContent}>
              <p
                style={{ marginBottom: "12px", fontSize: "13px", opacity: 0.8 }}
              >
                Click on the map to add route points. Point 0 is your starting location, then 1, 2, etc.
              </p>
              <div
                style={{
                  height: "350px",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <MapContainer
                  center={
                    routeDestination
                      ? [routeDestination.latitude, routeDestination.longitude]
                      : location
                        ? [location.latitude, location.longitude]
                        : [55.751244, 37.618423]
                  }
                  zoom={13}
                  style={{
                    height: "100%",
                    width: "100%",
                    filter: "grayscale(100%) invert(1)",
                  }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationSelector
                    setRouteDestination={setRouteDestination}
                    setRouteCoordinates={setRouteCoordinates}
                    startLocation={location}
                    addRoutePoint={addRoutePoint}
                    routePoints={routePoints}
                  />
                  {location && (
                    <Circle
                      center={[location.latitude, location.longitude]}
                      radius={50}
                      pathOptions={{
                        color: "black",
                        fillColor: "black",
                        fillOpacity: 0.8,
                        weight: 2,
                      }}
                    />
                  )}
                  {routeCoordinates && (
                    <Polyline
                      positions={routeCoordinates}
                      pathOptions={{
                        color: "black",
                        weight: 4,
                        opacity: 0.8,
                      }}
                    />
                  )}
                  {/* Отображаем все точки маршрута с номерами */}
                  {routePoints.map((point, index) => {
                    const icon = L.divIcon({
                      className: 'custom-marker-icon',
                      html: `<div style="
                        background-color: black;
                        color: white;
                        border-radius: 50%;
                        width: 32px;
                        height: 32px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        font-size: 14px;
                        border: 2px solid white;
                      ">${point.order + 1}</div>`,
                      iconSize: [32, 32],
                      iconAnchor: [16, 16],
                    });
                    
                    return (
                      <Marker
                        key={`point-${point.order}`}
                        position={[point.latitude, point.longitude]}
                        icon={icon}
                      />
                    );
                  })}
                </MapContainer>
              </div>
              
              {/* Список точек маршрута */}
              {routePoints.length > 0 && (
                <div style={{ marginTop: "12px", fontSize: "12px" }}>
                  <strong>Route Points ({routePoints.length}):</strong>
                  <div style={{ 
                    maxHeight: "120px", 
                    overflowY: "auto", 
                    marginTop: "8px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "4px",
                    padding: "8px"
                  }}>
                    {routePoints.map((point) => (
                      <div key={point.order} style={{ 
                        display: "flex", 
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "4px 0",
                        borderBottom: point.order < routePoints.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none"
                      }}>
                        <span>
                          <strong>Point {point.order + 1}:</strong> {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRoutePoint(point.order);
                            toast.info(`Point ${point.order + 1} removed`);
                          }}
                          style={{
                            background: "rgba(255,0,0,0.2)",
                            border: "1px solid rgba(255,0,0,0.4)",
                            borderRadius: "4px",
                            padding: "2px 8px",
                            cursor: "pointer",
                            fontSize: "11px",
                            color: "white"
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
                <button
                  onClick={() => {
                    clearRoute();
                    clearRoutePoints();
                    setIsMapModalOpen(false);
                  }}
                  className={styles.cancelButton}
                  style={{ fontSize: "13px", padding: "8px 16px" }}
                >
                  Clear All Points
                </button>
                <button
                  onClick={() => setIsMapModalOpen(false)}
                  className={styles.saveButton}
                  disabled={routePoints.length === 0}
                  style={{ fontSize: "13px", padding: "8px 16px" }}
                >
                  Confirm Route ({routePoints.length} {routePoints.length === 1 ? 'point' : 'points'})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Компонент для обработки кликов по карте
function LocationSelector({
  setRouteDestination,
  setRouteCoordinates,
  startLocation,
  addRoutePoint,
  routePoints,
}) {
  useMapEvents({
    async click(e) {
      const destination = {
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
      };
      console.log("Map clicked, adding route point:", destination);
      
      // Добавляем точку в массив routePoints
      addRoutePoint(destination);
      
      // Также сохраняем как routeDestination для обратной совместимости
      setRouteDestination(destination);
      console.log("Start location:", startLocation);

      // Получаем маршрут через все точки
      if (startLocation) {
        try {
          // Формируем список всех точек: начальная + все добавленные + новая
          const allPoints = [
            startLocation,
            ...routePoints.map(p => ({ latitude: p.latitude, longitude: p.longitude })),
            destination
          ];
          
          // Формируем строку координат для OSRM API
          const coordsString = allPoints
            .map(p => `${p.longitude},${p.latitude}`)
            .join(';');
          
          const response = await fetch(
            `https://router.project-osrm.org/route/v1/foot/${coordsString}?overview=full&geometries=geojson`,
          );
          const data = await response.json();

          if (data.routes && data.routes[0]) {
            const coordinates = data.routes[0].geometry.coordinates.map(
              (coord) => [coord[1], coord[0]],
            );
            setRouteCoordinates(coordinates);
            toast.success(`Route point ${routePoints.length + 1} added!`);
          }
        } catch (error) {
          console.error("Error fetching route:", error);
          toast.error("Failed to build route");
        }
      }
    },
  });

  return null;
}
