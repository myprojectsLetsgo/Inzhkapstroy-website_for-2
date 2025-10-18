// telegram-form.js
const TELEGRAM_CONFIG = {
    BOT_TOKEN: '8103044057:AAEcX6YtwgEcUkcyBDWeweYn7fS0nrsmPSI',
    CHAT_ID: '1456413902'
};

function initTelegramForm() {
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');

    if (!contactForm) {
        console.error('Форма не найдена!');
        return;
    }

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        submitBtn.disabled = true;

        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone') || 'Не указан',
            message: formData.get('message'),
            date: new Date().toLocaleString('ru-RU')
        };

        const telegramMessage = `НОВАЯ ЗАЯВКА С САЙТА

Компания: ООО "ИнжКапСтрой"
Имя: ${data.name}
Email: ${data.email}
Телефон: ${data.phone}
Сообщение: ${data.message}

Дата: ${data.date}`;

        try {
            console.log('Отправка в Telegram...');
            
            // Пробуем отправить напрямую
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

            // Если CORS ошибка, пробуем через proxy
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Ответ Telegram:', result);
            
            if (result.ok) {
                // Успешная отправка
                contactForm.style.display = 'none';
                formSuccess.style.display = 'block';
                
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
            
            // Если CORS ошибка, пробуем альтернативные методы
            if (error.name === 'TypeError' || error.message.includes('CORS') || error.message.includes('Network')) {
                console.log('CORS ошибка, пробуем альтернативный метод...');
                await tryAlternativeMethod(data, contactForm, formSuccess, submitBtn, originalText);
            } else {
                alert('Ошибка отправки. Позвоните нам: +7 (926) 879-71-03');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        }
    });

    console.log('Telegram форма инициализирована');
}

// Альтернативный метод через FormSubmit
async function tryAlternativeMethod(data, contactForm, formSuccess, submitBtn, originalText) {
    try {
        // Используем FormSubmit как fallback
        const formsubmitResponse = await fetch('https://formsubmit.co/ajax/info@inzhkapstroy.ru', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: data.name,
                email: data.email,
                phone: data.phone,
                message: data.message,
                _subject: '✅ Новая заявка с сайта ИнжКапСтрой',
                _template: 'table'
            })
        });

        if (formsubmitResponse.ok) {
            // Успешная отправка через FormSubmit
            contactForm.style.display = 'none';
            formSuccess.style.display = 'block';
            formSuccess.innerHTML = '<i class="fas fa-check-circle"></i> Спасибо! Заявка отправлена. Мы свяжемся с вами в течение 2 часов.';
            
            setTimeout(() => {
                contactForm.reset();
                contactForm.style.display = 'block';
                formSuccess.style.display = 'none';
                formSuccess.innerHTML = '<i class="fas fa-check-circle"></i> Спасибо! Ваша заявка принята. Мы свяжемся с вами в течение 2 часов.';
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 5000);
        } else {
            throw new Error('FormSubmit also failed');
        }
    } catch (fallbackError) {
        console.error('Fallback также не сработал:', fallbackError);
        alert('Не удалось отправить заявку автоматически. Позвоните нам: +7 (926) 879-71-03 или напишите на info@inzhkapstroy.ru');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Инициализируем форму когда DOM загружен
document.addEventListener('DOMContentLoaded', function() {
    initTelegramForm();
});