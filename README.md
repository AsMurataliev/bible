Библиотечная информационная система

1. Введение
Информационная система "Библиотека" предназначена для автоматизации управления книгами, читателями и процессами выдачи/возврата книг в библиотеке. Система предоставляет REST API для удобного взаимодействия с данными, что позволяет интегрировать её с другими приложениями или использовать через API-клиенты.

2. Цели и задачи
Цели:
Автоматизация учета книг и читателей.
Упрощение процессов выдачи и возврата книг.
Обеспечение быстрого доступа к информации о книгах и читателях.

Задачи:
Хранение данных о книгах (название, автор, год издания, статус).
Хранение данных о читателях (ФИО, email, телефон).
Учет выдачи книг (дата выдачи, дата возврата, статус).
Реализация функций добавления, обновления и удаления записей.
Валидация входных данных для обеспечения их корректности.

3. Функциональные требования
Управление книгами:
Добавление новой книги с указанием названия, автора, года издания и статуса.
Обновление информации о существующей книге.
Удаление книги из системы.
Получение списка всех книг.

Управление читателями:
Добавление нового читателя с указанием ФИО, email и телефона.
Обновление информации о читателе.
Удаление читателя из системы.
Получение списка всех читателей.

Управление выдачей книг:
Выдача книги читателю с фиксацией даты выдачи и статуса.
Возврат книги с обновлением статуса и даты возврата.
Получение информации о текущих выдачах.
Валидация данных:
Название книги: не пустое, минимум 1 символ.
Автор книги: не пустое, минимум 1 символ.
Год издания: целое число, не больше текущего года.
Статус книги: одно из значений: available, issued, repair.
Email читателя: корректный формат email.
Телефон читателя: допустимый формат (например, +7 (123) 456-78-90).

4. Нефункциональные требования
Платформа:
Веб-приложение с REST API, доступное через браузер или API-клиент (например, Postman).

Производительность:
Обработка запросов не более 2 секунд.

Надежность:
Использование базы данных SQLite с возможностью резервного копирования.
Безопасность:
Валидация входных данных.
Защита от некорректных запросов.
Документация:
Полное описание API через Swagger UI.

5. Технические требования
Язык разработки:
JavaScript (Node.js) с использованием фреймворка Express.
База данных:
SQLite (файл library.db).
Интерфейс:
REST API с документацией через Swagger UI (доступ по адресу /api-docs).
Среда разработки:
Любая среда (например, VS Code, WebStorm).

6. Этапы разработки
Анализ требований.
Проектирование системы.
Разработка программного кода.
Тестирование функционала.
Внедрение системы.
Подготовка документации.

7. Сроки выполнения
Общий срок реализации: 2 месяца.

8. Бюджет
Оценка стоимости разработки: определяется заказчиком (примерно 40,000 рублей).
