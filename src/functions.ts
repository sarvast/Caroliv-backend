/**
 * Azure Functions v4 Entry Point
 * All functions are registered here
 */

// Import all function handlers
import './functions/auth/login';
import './functions/auth/register';
import './functions/auth/syncProfile';
import './functions/data/getFoods';
import './functions/data/getExercises';
import './functions/admin/foodsAdmin';
import './functions/admin/exercisesAdmin';
import './functions/logs/getDailyLogs';
import './functions/logs/logFood';
import './functions/logs/logWorkout';

// Functions are auto-registered via app.http() calls in each file
