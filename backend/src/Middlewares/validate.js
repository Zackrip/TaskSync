import { body, validationResult } from "express-validator";

const registerUser = [
  body("name").notEmpty().withMessage("name is required"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is not valid"),

  body("password").notEmpty().withMessage("Password is required"),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => ({
        msg: error.msg,
      }));

      return res.status(400).json({
        errors: errorMessages,
      });
    }

    next();
  },
];

const loginUser = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is not valid"),

  body("password").notEmpty().withMessage("Password is required"),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => ({
        msg: error.msg,
      }));

      return res.status(400).json({
        errors: errorMessages,
      });
    }

    next();
  },
];

const validateResetPassword = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is not valid"),
  body("newPassword").notEmpty().withMessage("New password is required"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("confirm password is required"),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array().map((error) => ({
          msg: error.msg,
        })),
      });
    }

    next();
  },
];

export default {
  registerUser,
  loginUser,
  validateResetPassword,
};
