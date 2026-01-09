import { runStoreCarPageSmokeTest } from '../cases/store/car-page.smoke';
import 'dotenv/config';

(async () => {
    await runStoreCarPageSmokeTest('android');
    await runStoreCarPageSmokeTest('ios');
})();
