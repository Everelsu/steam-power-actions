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

let cached: Strings | null = null;

function detectLanguage(): string {
	try {
		const manager = (window as { LocalizationManager?: { m_rgLocalesToUse?: string[] } }).LocalizationManager;
		for (const raw of manager?.m_rgLocalesToUse ?? []) {
			const key = raw.toLowerCase();
			if (TRANSLATIONS[key]) return key;
			if (LANGUAGE_ALIASES[key]) return LANGUAGE_ALIASES[key];
			const base = key.split('-')[0];
			if (LANGUAGE_ALIASES[base]) return LANGUAGE_ALIASES[base];
		}
	} catch {
		/* fall through to english */
	}
	return 'english';
}

export function t(): Strings {
	if (!cached) cached = TRANSLATIONS[detectLanguage()] ?? en;
	return cached;
}
