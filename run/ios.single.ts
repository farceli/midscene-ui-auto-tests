import 'dotenv/config';
import { runStoreVehicleTypeJumpTest } from '@/cases/store/vehicle/vehicle-type-jump';
import { runPurchaseAnyItemTest } from '@/cases/store/connect/purchase-any-item';
import { runRandomProductJumpDetailPageTest } from '@/cases/store/selected/check-list';

// runStoreVehicleTypeJumpTest('ios');
runRandomProductJumpDetailPageTest('ios');