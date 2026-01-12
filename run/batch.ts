import 'dotenv/config';
import { runStoreCarPageSmokeTest } from '../cases/store/car-page.smoke';

(async () => {
    await runStoreCarPageSmokeTest('android');
    await runStoreCarPageSmokeTest('ios');
})();
