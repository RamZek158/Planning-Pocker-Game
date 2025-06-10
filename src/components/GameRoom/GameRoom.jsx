import React, { useState, useEffect } from "react";
import "./GameRoom.css";
import { PlayingCard, Carousel } from "../../components";
import { useCookies } from "react-cookie";
import { useParams } from "react-router";
import { getUsers } from "../../api/users/users";
import { getGameSettings } from "../../api/gameSettings/gameSettings";
import LoginUserModalWindow from "../LoginUserModalWindow/LoginUserModalWindow";

function GameRoom() {
	const [gameSettings, setGameSettings] = useState({});
	const [users, setUsers] = useState([]);
	const [modalOpen, setModalOpen] = useState(false);
	const [showToast, setShowToast] = useState(false);
	const [votes, setVotes] = useState({});
	const [showAllVotes, setShowAllVotes] = useState(false);

	const [cookies] = useCookies(["logged-user-info"]);
	const user = cookies["logged-user-info"];
	const { id } = useParams(); // ID комнаты из URL

	const gameOrganizer = gameSettings.userId === user.user_id;

	// Проверяем авторизацию при загрузке страницы
	useEffect(() => {
		if (!cookies["logged-user-info"]) {
			setModalOpen(true); // если не авторизован — открываем модалку
		}
	}, [cookies]);

	const handleLogin = () => {
		setModalOpen(false); // закрываем модалку после входа
	};

	// Загружаем данные игры и пользователей
	useEffect(() => {
		getGameSettings()
			.then((data) => {
				if (data) {
					setGameSettings(data || {});
				}
			})
			.catch((err) => {
				console.error("Ошибка загрузки:", err);
			});

		getUsers()
			.then((data) => {
				if (data) {
					setUsers(data);
				}
			})
			.catch((err) => {
				console.error("Ошибка загрузки:", err);
			});
	}, []);

	const copyLink = () => {
		const url = window.location.href;
		navigator.clipboard
			.writeText(url)
			.then(() => {
				setShowToast(true);
				setTimeout(() => {
					setShowToast(false);
				}, 3000);
			})
			.catch((err) => {
				console.error("Ошибка при копировании ссылки:", err);
			});
	};

	const getSuitColor = (suit) => {
		return suit === "hearts" || suit === "diams" ? "red" : "black";
	};

	// Обработка выбора карты
	const handleCardClick = (value, suit) => {
		const userId = user?.user_id;
		if (!userId) return;

		setVotes((prev) => ({
			...prev,
			[userId]: { value, suit },
		}));
	};

	// Проверяем, все ли проголосовали
	const allVoted = users.every((u) => votes[u.id]);

	return (
		<div className="pageContainer">
			{/* Кнопка "Пригласить участников" */}
			<div className="rightAligned">
				<button onClick={copyLink} className="btn primary">
					Пригласить участников
				</button>
				<div className={`toast ${showToast ? "show" : ""}`}>🔗 Ссылка скопирована!</div>
			</div>

			{/* Заголовок */}
			<h1 className="game-title">На обсуждении: {gameSettings.name}</h1>

			{/* Поле с голосами */}
			<div className="table">
				{showAllVotes ? (
					<div className="all-votes">
						{Object.entries(votes).map(([userId, vote]) => (
							<div key={userId} className="vote-card">
								<PlayingCard cardSuitName={vote.suit} cardValue={vote.value} cardColor={getSuitColor(vote.suit)} />
							</div>
						))}
					</div>
				) : (
					<p>Голосуют участники...</p>
				)}
			</div>

			{/* Управление голосованием */}
			<div className="controls">
				{allVoted && !showAllVotes && (
					<button className="btn primary" onClick={() => setShowAllVotes(true)}>
						Показать карты
					</button>
				)}

				{showAllVotes && (
					<button
						className="btn primary"
						onClick={() => {
							setVotes({});
							setShowAllVotes(false);
						}}
					>
						Начать новое голосование
					</button>
				)}
			</div>

			{/* Карусель снизу */}
			<div className="cards-containers">
				<Carousel items={gameSettings.votingType} onCardClick={handleCardClick} />
			</div>

			{/* Модальное окно */}
			{modalOpen && <LoginUserModalWindow onLogin={handleLogin} onClose={() => setModalOpen(false)} isCloseButton={true} />}
		</div>
	);
}

GameRoom.displayName = "GameRoom";
export default GameRoom;
