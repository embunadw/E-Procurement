import * as Yup from 'yup';

export const registerSchema = Yup.object().shape({
    roleId: Yup.string()
        .required('Role ID is required')
        .matches(/^\d+$/, 'Role ID must be a number'),
    nrp: Yup.string()
        .required('NRP is required')
        .matches(/^\d+$/, 'NRP must be a number'),
    name: Yup.string()
        .required('Name is required')
        .min(2, 'Name must be at least 2 characters long'),
    email: Yup.string()
        .email('Invalid email format')
        .required('Email is required'),
    password: Yup.string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters long'),
});

export const loginSchema = Yup.object({
    email: Yup.string().email("Email is invalid").required("Email is required"),
    password: Yup.string().required("Password is required"),
});