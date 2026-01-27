import 'dotenv/config';
import { runVehicleTypeJumpTest } from '@/cases/store/vehicle/vehicle-type-jump';
import { runPurchaseRandomItemsTest } from '@/cases/store/mmc/purchase-random-items';

runPurchaseRandomItemsTest('ios');
