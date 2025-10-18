// telegram-form.js
// Настройки Telegram бота для формы обратной связи

const TELEGRAM_CONFIG = {
    BOT_TOKEN: '8103044057:AAEcX6YtwgEcUkcyBDWeweYn7fS0nrsmPSI',
    CHAT_ID: '1456413902'
};

// Функция инициализации формы
function initTelegramForm() {
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');

    if (!contactForm) {
        console.error('Форма не найдена!');
        return;
    }

    // Обработка формы с отправкой в Telegram
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Показываем загрузку
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        submitBtn.disabled = true;

        // Собираем данные формы
        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone') || 'Не указан',
            message: formData.get('message'),
            date: new Date().toLocaleString('ru-RU')
        };

        // Формируем сообщение для Telegram
        const telegramMessage = `НОВАЯ ЗАЯВКА С САЙТА

Компания: ООО "ИнжКапСтрой"
Имя: ${data.name}
Email: ${data.email}
Телефон: ${data.phone}
Сообщение: ${data.message}

Дата: ${data.date}`;

        try {
            console.log('Отправка в Telegram...');
            
            // Отправляем сообщение в Telegram
            const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CONFIG.CHAT_ID,
                    text: telegramMessage
                })
            });

            const result = await response.json();
            console.log('Ответ Telegram:', result);
            
            if (result.ok) {
                // Успешная отправка
                contactForm.style.display = 'none';
                formSuccess.style.display = 'block';
                
                // Сбрасываем форму через 5 секунд
                setTimeout(() => {
                    contactForm.reset();
                    contactForm.style.display = 'block';
                    formSuccess.style.display = 'none';
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 5000);
            } else {
                throw new Error('Telegram error: ' + JSON.stringify(result));
            }
        } catch (error) {
            console.error('Ошибка отправки:', error);
            alert('Ошибка отправки. Позвоните нам: +7 (926) 879-71-03');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    console.log('Telegram форма инициализирована');
}

// Инициализируем форму когда DOM загружен
document.addEventListener('DOMContentLoaded', function() {
    initTelegramForm();
});

// Экспортируем для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initTelegramForm, TELEGRAM_CONFIG };
}