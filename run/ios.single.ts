import 'dotenv/config';
import { runVehicleTypeJumpTest } from '@/cases/store/vehicle/vehicle-type-jump';
import { runPurchaseRandomItemsTest } from '@/cases/store/mmc/purchase-random-items';
import { runFixtureDemoTest } from '@/cases/store/fixture-demo';

runFixtureDemoTest('ios');
