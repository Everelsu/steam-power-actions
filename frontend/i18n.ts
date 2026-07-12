import { PowerActionId } from './actions';

export interface Strings {
	title: string;
	cancel: string;
	now: string;
	menuTitle: string;
	doNothing: string;
	notAvailable: string;
	waitFor: string;
	allDownloads: string;
	countdownLabel: string;
	onlyInstalls: string;
	testCountdown: string;
	actions: Record<PowerActionId, string>;
	/** "<action> in <n>s", word order per language. */
	countdown: (label: string, seconds: number) => string;
}

const en: Strings = {
	title: 'Downloads finished',
	cancel: 'Cancel',
	now: 'Now',
	menuTitle: 'When downloads finish',
	doNothing: 'Do nothing',
	notAvailable: 'not available',
	waitFor: 'Wait for',
	allDownloads: 'All downloads',
	countdownLabel: 'Countdown',
	onlyInstalls: 'Only after new installs',
	testCountdown: 'Test countdown',
	actions: {
		shutdown: 'Shut down PC',
		restart: 'Restart PC',
		sleep: 'Sleep',
		hibernate: 'Hibernate',
		lock: 'Lock screen',
		quitsteam: 'Quit Steam',
	},
	countdown: (label, s) => `${label} in ${s}s`,
};

const TRANSLATIONS: Record<string, Strings> = {
	english: en,

	russian: {
		title: 'Загрузки завершены',
		cancel: 'Отмена',
		now: 'Сейчас',
		menuTitle: 'Когда загрузки завершатся',
		doNothing: 'Ничего не делать',
		notAvailable: 'недоступно',
		waitFor: 'Ждать',
		allDownloads: 'Все загрузки',
		countdownLabel: 'Отсчёт',
		onlyInstalls: 'Только после новых установок',
		testCountdown: 'Проверить отсчёт',
		actions: {
			shutdown: 'Выключить ПК',
			restart: 'Перезагрузить ПК',
			sleep: 'Спящий режим',
			hibernate: 'Гибернация',
			lock: 'Заблокировать экран',
			quitsteam: 'Выйти из Steam',
		},
		countdown: (label, s) => `${label} через ${s} с`,
	},

	ukrainian: {
		title: 'Завантаження завершено',
		cancel: 'Скасувати',
		now: 'Зараз',
		menuTitle: 'Коли завантаження завершаться',
		doNothing: 'Нічого не робити',
		notAvailable: 'недоступно',
		waitFor: 'Чекати',
		allDownloads: 'Усі завантаження',
		countdownLabel: 'Відлік',
		onlyInstalls: 'Лише після нових встановлень',
		testCountdown: 'Перевірити відлік',
		actions: {
			shutdown: 'Вимкнути ПК',
			restart: 'Перезавантажити ПК',
			sleep: 'Сплячий режим',
			hibernate: 'Гібернація',
			lock: 'Заблокувати екран',
			quitsteam: 'Вийти зі Steam',
		},
		countdown: (label, s) => `${label} через ${s} с`,
	},

	german: {
		title: 'Downloads abgeschlossen',
		cancel: 'Abbrechen',
		now: 'Jetzt',
		menuTitle: 'Wenn Downloads fertig sind',
		doNothing: 'Nichts tun',
		notAvailable: 'nicht verfügbar',
		waitFor: 'Warten auf',
		allDownloads: 'Alle Downloads',
		countdownLabel: 'Countdown',
		onlyInstalls: 'Nur nach Neuinstallationen',
		testCountdown: 'Countdown testen',
		actions: {
			shutdown: 'PC herunterfahren',
			restart: 'PC neu starten',
			sleep: 'Energiesparmodus',
			hibernate: 'Ruhezustand',
			lock: 'Bildschirm sperren',
			quitsteam: 'Steam beenden',
		},
		countdown: (label, s) => `${label} in ${s}s`,
	},

	french: {
		title: 'Téléchargements terminés',
		cancel: 'Annuler',
		now: 'Maintenant',
		menuTitle: 'À la fin des téléchargements',
		doNothing: 'Ne rien faire',
		notAvailable: 'indisponible',
		waitFor: 'Attendre',
		allDownloads: 'Tous les téléchargements',
		countdownLabel: 'Compte à rebours',
		onlyInstalls: 'Seulement après une installation',
		testCountdown: 'Tester le compte à rebours',
		actions: {
			shutdown: 'Éteindre le PC',
			restart: 'Redémarrer le PC',
			sleep: 'Veille',
			hibernate: 'Veille prolongée',
			lock: "Verrouiller l'écran",
			quitsteam: 'Quitter Steam',
		},
		countdown: (label, s) => `${label} dans ${s}s`,
	},

	spanish: {
		title: 'Descargas completadas',
		cancel: 'Cancelar',
		now: 'Ahora',
		menuTitle: 'Al terminar las descargas',
		doNothing: 'No hacer nada',
		notAvailable: 'no disponible',
		waitFor: 'Esperar a',
		allDownloads: 'Todas las descargas',
		countdownLabel: 'Cuenta atrás',
		onlyInstalls: 'Solo tras nuevas instalaciones',
		testCountdown: 'Probar cuenta atrás',
		actions: {
			shutdown: 'Apagar el PC',
			restart: 'Reiniciar el PC',
			sleep: 'Suspender',
			hibernate: 'Hibernar',
			lock: 'Bloquear pantalla',
			quitsteam: 'Salir de Steam',
		},
		countdown: (label, s) => `${label} en ${s}s`,
	},

	latam: {
		title: 'Descargas completadas',
		cancel: 'Cancelar',
		now: 'Ahora',
		menuTitle: 'Al terminar las descargas',
		doNothing: 'No hacer nada',
		notAvailable: 'no disponible',
		waitFor: 'Esperar a',
		allDownloads: 'Todas las descargas',
		countdownLabel: 'Cuenta regresiva',
		onlyInstalls: 'Solo tras nuevas instalaciones',
		testCountdown: 'Probar cuenta regresiva',
		actions: {
			shutdown: 'Apagar la PC',
			restart: 'Reiniciar la PC',
			sleep: 'Suspender',
			hibernate: 'Hibernar',
			lock: 'Bloquear pantalla',
			quitsteam: 'Salir de Steam',
		},
		countdown: (label, s) => `${label} en ${s}s`,
	},

	brazilian: {
		title: 'Downloads concluídos',
		cancel: 'Cancelar',
		now: 'Agora',
		menuTitle: 'Ao concluir os downloads',
		doNothing: 'Não fazer nada',
		notAvailable: 'indisponível',
		waitFor: 'Aguardar',
		allDownloads: 'Todos os downloads',
		countdownLabel: 'Contagem regressiva',
		onlyInstalls: 'Apenas após novas instalações',
		testCountdown: 'Testar contagem',
		actions: {
			shutdown: 'Desligar o PC',
			restart: 'Reiniciar o PC',
			sleep: 'Suspender',
			hibernate: 'Hibernar',
			lock: 'Bloquear tela',
			quitsteam: 'Sair do Steam',
		},
		countdown: (label, s) => `${label} em ${s}s`,
	},

	portuguese: {
		title: 'Transferências concluídas',
		cancel: 'Cancelar',
		now: 'Agora',
		menuTitle: 'Ao concluir as transferências',
		doNothing: 'Não fazer nada',
		notAvailable: 'indisponível',
		waitFor: 'Aguardar',
		allDownloads: 'Todas as transferências',
		countdownLabel: 'Contagem decrescente',
		onlyInstalls: 'Apenas após novas instalações',
		testCountdown: 'Testar contagem',
		actions: {
			shutdown: 'Desligar o PC',
			restart: 'Reiniciar o PC',
			sleep: 'Suspender',
			hibernate: 'Hibernar',
			lock: 'Bloquear ecrã',
			quitsteam: 'Sair do Steam',
		},
		countdown: (label, s) => `${label} em ${s}s`,
	},

	italian: {
		title: 'Download completati',
		cancel: 'Annulla',
		now: 'Ora',
		menuTitle: 'Al termine dei download',
		doNothing: 'Non fare nulla',
		notAvailable: 'non disponibile',
		waitFor: 'Attendi',
		allDownloads: 'Tutti i download',
		countdownLabel: 'Conto alla rovescia',
		onlyInstalls: 'Solo dopo nuove installazioni',
		testCountdown: 'Prova conto alla rovescia',
		actions: {
			shutdown: 'Spegni il PC',
			restart: 'Riavvia il PC',
			sleep: 'Sospendi',
			hibernate: 'Iberna',
			lock: 'Blocca schermo',
			quitsteam: 'Esci da Steam',
		},
		countdown: (label, s) => `${label} tra ${s}s`,
	},

	polish: {
		title: 'Pobieranie zakończone',
		cancel: 'Anuluj',
		now: 'Teraz',
		menuTitle: 'Po zakończeniu pobierania',
		doNothing: 'Nic nie rób',
		notAvailable: 'niedostępne',
		waitFor: 'Czekaj na',
		allDownloads: 'Wszystkie pobierania',
		countdownLabel: 'Odliczanie',
		onlyInstalls: 'Tylko po nowych instalacjach',
		testCountdown: 'Testuj odliczanie',
		actions: {
			shutdown: 'Wyłącz komputer',
			restart: 'Uruchom ponownie',
			sleep: 'Uśpij',
			hibernate: 'Hibernuj',
			lock: 'Zablokuj ekran',
			quitsteam: 'Zamknij Steam',
		},
		countdown: (label, s) => `${label} za ${s}s`,
	},

	turkish: {
		title: 'İndirmeler tamamlandı',
		cancel: 'İptal',
		now: 'Şimdi',
		menuTitle: 'İndirmeler bitince',
		doNothing: 'Hiçbir şey yapma',
		notAvailable: 'kullanılamıyor',
		waitFor: 'Bekle',
		allDownloads: 'Tüm indirmeler',
		countdownLabel: 'Geri sayım',
		onlyInstalls: 'Yalnızca yeni kurulumlardan sonra',
		testCountdown: 'Geri sayımı dene',
		actions: {
			shutdown: 'Bilgisayarı kapat',
			restart: 'Bilgisayarı yeniden başlat',
			sleep: 'Uyku',
			hibernate: 'Hazırda beklet',
			lock: 'Ekranı kilitle',
			quitsteam: "Steam'den çık",
		},
		countdown: (label, s) => `${s}s içinde ${label}`,
	},

	czech: {
		title: 'Stahování dokončeno',
		cancel: 'Zrušit',
		now: 'Nyní',
		menuTitle: 'Po dokončení stahování',
		doNothing: 'Nedělat nic',
		notAvailable: 'nedostupné',
		waitFor: 'Čekat na',
		allDownloads: 'Veškerá stahování',
		countdownLabel: 'Odpočet',
		onlyInstalls: 'Jen po nových instalacích',
		testCountdown: 'Otestovat odpočet',
		actions: {
			shutdown: 'Vypnout PC',
			restart: 'Restartovat PC',
			sleep: 'Režim spánku',
			hibernate: 'Hibernace',
			lock: 'Zamknout obrazovku',
			quitsteam: 'Ukončit Steam',
		},
		countdown: (label, s) => `${label} za ${s}s`,
	},

	dutch: {
		title: 'Downloads voltooid',
		cancel: 'Annuleren',
		now: 'Nu',
		menuTitle: 'Wanneer downloads klaar zijn',
		doNothing: 'Niets doen',
		notAvailable: 'niet beschikbaar',
		waitFor: 'Wachten op',
		allDownloads: 'Alle downloads',
		countdownLabel: 'Aftellen',
		onlyInstalls: 'Alleen na nieuwe installaties',
		testCountdown: 'Aftellen testen',
		actions: {
			shutdown: 'Pc afsluiten',
			restart: 'Pc opnieuw opstarten',
			sleep: 'Slaapstand',
			hibernate: 'Sluimerstand',
			lock: 'Scherm vergrendelen',
			quitsteam: 'Steam afsluiten',
		},
		countdown: (label, s) => `${label} over ${s}s`,
	},

	schinese: {
		title: '下载已完成',
		cancel: '取消',
		now: '立即',
		menuTitle: '下载完成后',
		doNothing: '不执行任何操作',
		notAvailable: '不可用',
		waitFor: '等待',
		allDownloads: '所有下载',
		countdownLabel: '倒计时',
		onlyInstalls: '仅在新安装后',
		testCountdown: '测试倒计时',
		actions: {
			shutdown: '关闭电脑',
			restart: '重启电脑',
			sleep: '睡眠',
			hibernate: '休眠',
			lock: '锁定屏幕',
			quitsteam: '退出 Steam',
		},
		countdown: (label, s) => `${s} 秒后${label}`,
	},

	tchinese: {
		title: '下載已完成',
		cancel: '取消',
		now: '立即',
		menuTitle: '下載完成後',
		doNothing: '不執行任何動作',
		notAvailable: '無法使用',
		waitFor: '等待',
		allDownloads: '所有下載',
		countdownLabel: '倒數計時',
		onlyInstalls: '僅在全新安裝後',
		testCountdown: '測試倒數',
		actions: {
			shutdown: '關閉電腦',
			restart: '重新啟動電腦',
			sleep: '睡眠',
			hibernate: '休眠',
			lock: '鎖定螢幕',
			quitsteam: '結束 Steam',
		},
		countdown: (label, s) => `${s} 秒後${label}`,
	},

	japanese: {
		title: 'ダウンロード完了',
		cancel: 'キャンセル',
		now: '今すぐ',
		menuTitle: 'ダウンロード完了時',
		doNothing: '何もしない',
		notAvailable: '利用不可',
		waitFor: '待機対象',
		allDownloads: 'すべてのダウンロード',
		countdownLabel: 'カウントダウン',
		onlyInstalls: '新規インストール後のみ',
		testCountdown: 'カウントダウンをテスト',
		actions: {
			shutdown: 'PC をシャットダウン',
			restart: 'PC を再起動',
			sleep: 'スリープ',
			hibernate: '休止状態',
			lock: '画面をロック',
			quitsteam: 'Steam を終了',
		},
		countdown: (label, s) => `${s}秒後に${label}`,
	},

	koreana: {
		title: '다운로드 완료',
		cancel: '취소',
		now: '지금',
		menuTitle: '다운로드가 끝나면',
		doNothing: '아무것도 하지 않음',
		notAvailable: '사용 불가',
		waitFor: '대기 대상',
		allDownloads: '모든 다운로드',
		countdownLabel: '카운트다운',
		onlyInstalls: '새 설치 후에만',
		testCountdown: '카운트다운 테스트',
		actions: {
			shutdown: 'PC 종료',
			restart: 'PC 재시작',
			sleep: '절전',
			hibernate: '최대 절전 모드',
			lock: '화면 잠금',
			quitsteam: 'Steam 종료',
		},
		countdown: (label, s) => `${s}초 후 ${label}`,
	},
};

/** Short/ISO codes Steam may report (e.g. "ru", "zh-CN") → Steam API language name. */
const LANGUAGE_ALIASES: Record<string, string> = {
	en: 'english',
	ru: 'russian',
	uk: 'ukrainian',
	de: 'german',
	fr: 'french',
	es: 'spanish',
	'es-419': 'latam',
	'pt-br': 'brazilian',
	pt: 'portuguese',
	it: 'italian',
	pl: 'polish',
	tr: 'turkish',
	cs: 'czech',
	nl: 'dutch',
	zh: 'schinese',
	'zh-cn': 'schinese',
	'zh-hans': 'schinese',
	'zh-tw': 'tchinese',
	'zh-hant': 'tchinese',
	ja: 'japanese',
	ko: 'koreana',
};

export interface SettingsStrings {
	menuActions: string;
	menuActionsDesc: string;
	alwaysAvailable: string;
	defaultAction: string;
	defaultActionDesc: string;
	countdownDesc: string;
	onlyInstallsDesc: string;
}

const settingsEn: SettingsStrings = {
	menuActions: 'Menu actions',
	menuActionsDesc: 'Choose which power actions appear in the menu. Shut down and Restart are always available.',
	alwaysAvailable: 'Always available',
	defaultAction: 'Default action',
	defaultActionDesc: 'Which action is preselected in the menu.',
	countdownDesc: 'Seconds to cancel before the action runs.',
	onlyInstallsDesc: 'Ignore routine updates; act only when a newly installed game finishes downloading.',
};

const SETTINGS_TRANSLATIONS: Record<string, SettingsStrings> = {
	english: settingsEn,
	russian: {
		menuActions: 'Действия в меню',
		menuActionsDesc: 'Выберите, какие действия показывать в меню. Выключение и перезагрузка доступны всегда.',
		alwaysAvailable: 'Доступно всегда',
		defaultAction: 'Действие по умолчанию',
		defaultActionDesc: 'Какое действие выбрано в меню изначально.',
		countdownDesc: 'Секунд на отмену перед выполнением действия.',
		onlyInstallsDesc: 'Игнорировать обычные обновления; срабатывать только после установки новой игры.',
	},
	ukrainian: {
		menuActions: 'Дії в меню',
		menuActionsDesc: 'Оберіть, які дії показувати в меню. Вимкнення та перезавантаження доступні завжди.',
		alwaysAvailable: 'Доступно завжди',
		defaultAction: 'Дія за замовчуванням',
		defaultActionDesc: 'Яка дія обрана в меню початково.',
		countdownDesc: 'Секунд на скасування перед виконанням дії.',
		onlyInstallsDesc: 'Ігнорувати звичайні оновлення; спрацьовувати лише після встановлення нової гри.',
	},
	german: {
		menuActions: 'Menüaktionen',
		menuActionsDesc: 'Wähle, welche Aktionen im Menü erscheinen. Herunterfahren und Neustart sind immer verfügbar.',
		alwaysAvailable: 'Immer verfügbar',
		defaultAction: 'Standardaktion',
		defaultActionDesc: 'Welche Aktion im Menü vorausgewählt ist.',
		countdownDesc: 'Sekunden zum Abbrechen, bevor die Aktion ausgeführt wird.',
		onlyInstallsDesc: 'Routine-Updates ignorieren; nur nach Neuinstallation eines Spiels auslösen.',
	},
	french: {
		menuActions: 'Actions du menu',
		menuActionsDesc: 'Choisissez les actions affichées dans le menu. Éteindre et Redémarrer sont toujours disponibles.',
		alwaysAvailable: 'Toujours disponible',
		defaultAction: 'Action par défaut',
		defaultActionDesc: "L'action présélectionnée dans le menu.",
		countdownDesc: "Secondes pour annuler avant l'exécution de l'action.",
		onlyInstallsDesc: 'Ignorer les mises à jour ; agir seulement après une nouvelle installation.',
	},
	spanish: {
		menuActions: 'Acciones del menú',
		menuActionsDesc: 'Elige qué acciones aparecen en el menú. Apagar y Reiniciar están siempre disponibles.',
		alwaysAvailable: 'Siempre disponible',
		defaultAction: 'Acción predeterminada',
		defaultActionDesc: 'Qué acción está preseleccionada en el menú.',
		countdownDesc: 'Segundos para cancelar antes de ejecutar la acción.',
		onlyInstallsDesc: 'Ignorar actualizaciones; actuar solo tras instalar un juego nuevo.',
	},
	latam: {
		menuActions: 'Acciones del menú',
		menuActionsDesc: 'Elige qué acciones aparecen en el menú. Apagar y Reiniciar están siempre disponibles.',
		alwaysAvailable: 'Siempre disponible',
		defaultAction: 'Acción predeterminada',
		defaultActionDesc: 'Qué acción está preseleccionada en el menú.',
		countdownDesc: 'Segundos para cancelar antes de ejecutar la acción.',
		onlyInstallsDesc: 'Ignorar actualizaciones; actuar solo tras instalar un juego nuevo.',
	},
	brazilian: {
		menuActions: 'Ações do menu',
		menuActionsDesc: 'Escolha quais ações aparecem no menu. Desligar e Reiniciar estão sempre disponíveis.',
		alwaysAvailable: 'Sempre disponível',
		defaultAction: 'Ação padrão',
		defaultActionDesc: 'Qual ação vem pré-selecionada no menu.',
		countdownDesc: 'Segundos para cancelar antes de executar a ação.',
		onlyInstallsDesc: 'Ignorar atualizações comuns; agir só após instalar um jogo novo.',
	},
	portuguese: {
		menuActions: 'Ações do menu',
		menuActionsDesc: 'Escolha que ações aparecem no menu. Desligar e Reiniciar estão sempre disponíveis.',
		alwaysAvailable: 'Sempre disponível',
		defaultAction: 'Ação predefinida',
		defaultActionDesc: 'Que ação vem pré-selecionada no menu.',
		countdownDesc: 'Segundos para cancelar antes de executar a ação.',
		onlyInstallsDesc: 'Ignorar atualizações comuns; agir só após instalar um jogo novo.',
	},
	italian: {
		menuActions: 'Azioni del menu',
		menuActionsDesc: 'Scegli quali azioni compaiono nel menu. Spegni e Riavvia sono sempre disponibili.',
		alwaysAvailable: 'Sempre disponibile',
		defaultAction: 'Azione predefinita',
		defaultActionDesc: "Quale azione è preselezionata nel menu.",
		countdownDesc: "Secondi per annullare prima dell'esecuzione.",
		onlyInstallsDesc: 'Ignora gli aggiornamenti; agisci solo dopo una nuova installazione.',
	},
	polish: {
		menuActions: 'Akcje menu',
		menuActionsDesc: 'Wybierz, które akcje pojawiają się w menu. Wyłączenie i restart są zawsze dostępne.',
		alwaysAvailable: 'Zawsze dostępne',
		defaultAction: 'Akcja domyślna',
		defaultActionDesc: 'Która akcja jest wstępnie wybrana w menu.',
		countdownDesc: 'Sekundy na anulowanie przed wykonaniem akcji.',
		onlyInstallsDesc: 'Ignoruj zwykłe aktualizacje; działaj tylko po instalacji nowej gry.',
	},
	turkish: {
		menuActions: 'Menü eylemleri',
		menuActionsDesc: 'Menüde hangi eylemlerin görüneceğini seçin. Kapatma ve Yeniden başlatma her zaman kullanılabilir.',
		alwaysAvailable: 'Her zaman kullanılabilir',
		defaultAction: 'Varsayılan eylem',
		defaultActionDesc: 'Menüde önceden seçili eylem.',
		countdownDesc: 'Eylem çalışmadan önce iptal için saniye.',
		onlyInstallsDesc: 'Rutin güncellemeleri yok say; yalnızca yeni kurulumdan sonra çalış.',
	},
	czech: {
		menuActions: 'Akce nabídky',
		menuActionsDesc: 'Vyberte, které akce se zobrazí v nabídce. Vypnutí a restart jsou vždy dostupné.',
		alwaysAvailable: 'Vždy dostupné',
		defaultAction: 'Výchozí akce',
		defaultActionDesc: 'Která akce je v nabídce předvybraná.',
		countdownDesc: 'Sekundy na zrušení před provedením akce.',
		onlyInstallsDesc: 'Ignorovat běžné aktualizace; jednat jen po instalaci nové hry.',
	},
	dutch: {
		menuActions: 'Menuacties',
		menuActionsDesc: 'Kies welke acties in het menu verschijnen. Afsluiten en Herstarten zijn altijd beschikbaar.',
		alwaysAvailable: 'Altijd beschikbaar',
		defaultAction: 'Standaardactie',
		defaultActionDesc: 'Welke actie vooraf is geselecteerd in het menu.',
		countdownDesc: 'Seconden om te annuleren voordat de actie wordt uitgevoerd.',
		onlyInstallsDesc: 'Negeer gewone updates; alleen na een nieuwe installatie handelen.',
	},
	schinese: {
		menuActions: '菜单操作',
		menuActionsDesc: '选择菜单中显示哪些操作。关机和重启始终可用。',
		alwaysAvailable: '始终可用',
		defaultAction: '默认操作',
		defaultActionDesc: '菜单中预先选中的操作。',
		countdownDesc: '操作执行前可取消的秒数。',
		onlyInstallsDesc: '忽略常规更新；仅在安装新游戏后执行。',
	},
	tchinese: {
		menuActions: '選單操作',
		menuActionsDesc: '選擇選單中顯示哪些操作。關機和重新啟動一律可用。',
		alwaysAvailable: '一律可用',
		defaultAction: '預設操作',
		defaultActionDesc: '選單中預先選取的操作。',
		countdownDesc: '操作執行前可取消的秒數。',
		onlyInstallsDesc: '忽略一般更新；僅在安裝新遊戲後執行。',
	},
	japanese: {
		menuActions: 'メニューの動作',
		menuActionsDesc: 'メニューに表示する動作を選びます。シャットダウンと再起動は常に利用できます。',
		alwaysAvailable: '常に利用可能',
		defaultAction: '既定の動作',
		defaultActionDesc: 'メニューで最初に選ばれている動作。',
		countdownDesc: '実行前にキャンセルできる秒数。',
		onlyInstallsDesc: '通常の更新は無視し、新規インストール完了時のみ実行します。',
	},
	koreana: {
		menuActions: '메뉴 동작',
		menuActionsDesc: '메뉴에 표시할 동작을 선택하세요. 종료와 재시작은 항상 사용할 수 있습니다.',
		alwaysAvailable: '항상 사용 가능',
		defaultAction: '기본 동작',
		defaultActionDesc: '메뉴에서 미리 선택되는 동작.',
		countdownDesc: '동작 실행 전 취소할 수 있는 시간(초).',
		onlyInstallsDesc: '일반 업데이트는 무시하고 새 설치 완료 시에만 실행합니다.',
	},
};

let cachedLang: string | null = null;
let cached: Strings | null = null;
let cachedSettings: SettingsStrings | null = null;

function detectLanguage(): string {
	if (cachedLang) return cachedLang;
	try {
		const manager = (window as { LocalizationManager?: { m_rgLocalesToUse?: string[] } }).LocalizationManager;
		for (const raw of manager?.m_rgLocalesToUse ?? []) {
			const key = raw.toLowerCase();
			if (TRANSLATIONS[key]) return (cachedLang = key);
			if (LANGUAGE_ALIASES[key]) return (cachedLang = LANGUAGE_ALIASES[key]);
			const base = key.split('-')[0];
			if (LANGUAGE_ALIASES[base]) return (cachedLang = LANGUAGE_ALIASES[base]);
		}
	} catch {
		/* fall through to english */
	}
	return (cachedLang = 'english');
}

export function t(): Strings {
	if (!cached) cached = TRANSLATIONS[detectLanguage()] ?? en;
	return cached;
}

export function tSettings(): SettingsStrings {
	if (!cachedSettings) cachedSettings = SETTINGS_TRANSLATIONS[detectLanguage()] ?? settingsEn;
	return cachedSettings;
}
