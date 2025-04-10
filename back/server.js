const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('front'));

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './db/library.db',
  logging: false
});

const Book = sequelize.define('Book', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  year: {
    type: DataTypes.INTEGER,
    validate: {
      isInt: true,
      min: 0,
      max: new Date().getFullYear()
    }
  },
  status: {
    type: DataTypes.ENUM('available', 'issued', 'repair'),
    defaultValue: 'available'
  }
});

const Reader = sequelize.define('Reader', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    validate: {
      is: /^\+?[\d\s\-\(\)]{7,}$/i
    }
  }
});

const BookIssue = sequelize.define('BookIssue', {
  issueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  returnDate: {
    type: DataTypes.DATEONLY
  },
  status: {
    type: DataTypes.ENUM('issued', 'returned', 'overdue'),
    defaultValue: 'issued'
  }
});

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Библиотечная информационная система',
      version: '1.0.0',
      description: 'API для управления библиотекой: книги, читатели, выдача и отчеты',
    },
    components: {
      schemas: {
        Book: {
          type: 'object',
          required: ['title', 'author'],
          properties: {
            id: {
              type: 'integer',
              description: 'Идентификатор книги'
            },
            title: {
              type: 'string',
              description: 'Название книги',
              example: 'Война и мир'
            },
            author: {
              type: 'string',
              description: 'Автор книги',
              example: 'Лев Толстой'
            },
            year: {
              type: 'integer',
              description: 'Год издания',
              example: 1869
            },
            status: {
              type: 'string',
              enum: ['available', 'issued', 'repair'],
              description: 'Статус книги',
              example: 'available'
            }
          }
        },
        Reader: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            id: {
              type: 'integer',
              description: 'Идентификатор читателя'
            },
            name: {
              type: 'string',
              description: 'ФИО читателя',
              example: 'Иванов Иван Иванович'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email читателя',
              example: 'ivanov@example.com'
            },
            phone: {
              type: 'string',
              description: 'Телефон читателя',
              example: '+7 (123) 456-78-90'
            }
          }
        },
        BookIssue: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Идентификатор выдачи'
            },
            BookId: {
              type: 'integer',
              description: 'ID книги'
            },
            ReaderId: {
              type: 'integer',
              description: 'ID читателя'
            },
            issueDate: {
              type: 'string',
              format: 'date',
              description: 'Дата выдачи'
            },
            returnDate: {
              type: 'string',
              format: 'date',
              description: 'Дата возврата'
            },
            status: {
              type: 'string',
              enum: ['issued', 'returned', 'overdue'],
              description: 'Статус выдачи'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Сообщение об ошибке'
            }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./back/server.js'],
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: false });
    console.log('База данных подключена и синхронизирована');
  } catch (error) {
    console.error('Ошибка базы данных:', error);
  }
}

initializeDatabase();


/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Управление книгами
 */

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Получить список всех книг
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Список книг
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/books', async (req, res) => {
  try {
    const books = await Book.findAll();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Добавить новую книгу
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       201:
 *         description: Книга успешно добавлена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Неверные данные
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/books', async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * tags:
 *   name: Readers
 *   description: Управление читателями
 */

/**
 * @swagger
 * /readers:
 *   get:
 *     summary: Получить список всех читателей
 *     tags: [Readers]
 *     responses:
 *       200:
 *         description: Список читателей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reader'
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/readers', async (req, res) => {
  try {
    const readers = await Reader.findAll();
    res.json(readers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /readers:
 *   post:
 *     summary: Добавить нового читателя
 *     tags: [Readers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reader'
 *     responses:
 *       201:
 *         description: Читатель успешно добавлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reader'
 *       400:
 *         description: Неверные данные
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/readers', async (req, res) => {
  try {
    const reader = await Reader.create(req.body);
    res.status(201).json(reader);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * tags:
 *   name: Issues
 *   description: Управление выдачей книг
 */

/**
 * @swagger
 * /issue:
 *   post:
 *     summary: Выдать книгу читателю
 *     tags: [Issues]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookId
 *               - readerId
 *             properties:
 *               bookId:
 *                 type: integer
 *                 description: ID книги
 *               readerId:
 *                 type: integer
 *                 description: ID читателя
 *     responses:
 *       201:
 *         description: Книга успешно выдана
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookIssue'
 *       400:
 *         description: Неверные данные или книга недоступна
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Книга или читатель не найдены
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/issue', async (req, res) => {
  try {
    const { bookId, readerId } = req.body;

    // Проверяем, доступна ли книга
    const book = await Book.findByPk(bookId);
    if (!book || book.status !== 'available') {
      return res.status(400).json({ error: 'Книга недоступна для выдачи' });
    }

    // Создаем запись о выдаче
    const issue = await BookIssue.create({
      BookId: bookId,
      ReaderId: readerId,
      status: 'issued'
    });

    // Обновляем статус книги
    await book.update({ status: 'issued' });

    res.status(201).json(issue);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /return:
 *   post:
 *     summary: Вернуть книгу в библиотеку
 *     tags: [Issues]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookId
 *             properties:
 *               bookId:
 *                 type: integer
 *                 description: ID книги
 *     responses:
 *       200:
 *         description: Книга успешно возвращена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookIssue'
 *       400:
 *         description: Неверные данные
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Активная выдача не найдена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/return', async (req, res) => {
  try {
    const { bookId } = req.body;

    const issue = await BookIssue.findOne({
      where: {
        BookId: bookId,
        status: 'issued'
      }
    });

    if (!issue) {
      return res.status(404).json({ error: 'Активная выдача не найдена' });
    }

    // Обновляем выдачу
    await issue.update({
      returnDate: new Date(),
      status: 'returned'
    });

    // Обновляем статус книги
    const book = await Book.findByPk(bookId);
    await book.update({ status: 'available' });

    res.json(issue);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});





const PORT = process.env.PORT || 3000;

async function startServer() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`Сервер запущен на порту http://localhost:${PORT}`);
    console.log(`Swagger docs доступны по адресу http://localhost:${PORT}/api-docs`);
  });
}

startServer().catch(error => {
  console.error('Ошибка запуска сервера:', error);
});
