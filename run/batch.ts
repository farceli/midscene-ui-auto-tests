import 'dotenv/config';
import { runStoreVehicleTypeJumpTest } from '@/cases/store/vehicle/vehicle-type-jump';

(async () => {
    await runStoreVehicleTypeJumpTest('android');
    await runStoreVehicleTypeJumpTest('ios');
})();
