import { useDispatch, useSelector } from 'react-redux';

/**
 * Custom useDispatch hook to avoid importing useDispatch everywhere.
 */
export const useAppDispatch = () => useDispatch();

/**
 * Custom useSelector hook to avoid importing useSelector everywhere.
 */
export const useAppSelector = (selector) => useSelector(selector);
