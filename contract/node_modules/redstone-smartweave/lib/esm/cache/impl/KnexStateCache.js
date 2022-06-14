import { MemBlockHeightSwCache } from '../index';
import { LoggerFactory } from '../../logging/index';
import stringify from 'safe-stable-stringify';
/**
 * An implementation of {@link BlockHeightSwCache} that stores its data (ie. contracts state)
 * in a Knex-compatible storage (PostgreSQL, CockroachDB, MSSQL, MySQL, MariaDB, SQLite3, Oracle, and Amazon Redshift)
 * https://knexjs.org
 */
export class KnexStateCache extends MemBlockHeightSwCache {
    constructor(knex, maxStoredInMemoryBlockHeights = Number.MAX_SAFE_INTEGER, cache) {
        super(maxStoredInMemoryBlockHeights);
        this.knex = knex;
        this.kLogger = LoggerFactory.INST.create('KnexBlockHeightSwCache');
        this.lastFlushHeight = new Map();
        this.isFlushing = false;
        this.isDirty = false;
        this.saveCache = this.saveCache.bind(this);
        this.flush = this.flush.bind(this);
        this.kLogger.info(`Loaded ${cache.length} cache entries from db`);
        cache.forEach((entry) => {
            this.putSync({
                cacheKey: entry.contract_id,
                blockHeight: entry.height
            }, JSON.parse(entry.state));
            this.lastFlushHeight.set(entry.contract_id, entry.height);
        });
    }
    static async init(knex, maxStoredInMemoryBlockHeights = Number.MAX_SAFE_INTEGER) {
        if (!(await knex.schema.hasTable('states'))) {
            await knex.schema.createTable('states', (table) => {
                table.string('contract_id', 64).notNullable().index();
                table.integer('height').notNullable().index();
                table.text('state').notNullable();
                table.unique(['contract_id', 'height'], { indexName: 'states_composite_index' });
            });
        }
        const cache = await knex
            .select(['contract_id', 'height', 'state'])
            .from('states')
            .max('height')
            .groupBy(['contract_id']);
        return new KnexStateCache(knex, maxStoredInMemoryBlockHeights, cache);
    }
    async saveCache() {
        this.isFlushing = true;
        this.kLogger.info(`==== Persisting cache ====`);
        try {
            const contracts = Object.keys(this.storage);
            for (const contractTxId of contracts) {
                // store only highest cached height
                const toStore = await this.getLast(contractTxId);
                // this check is a bit paranoid, since we're iterating on storage keys..
                if (toStore !== null) {
                    const { cachedHeight, cachedValue } = toStore;
                    if (this.lastFlushHeight.has(contractTxId) && this.lastFlushHeight.get(contractTxId) >= cachedHeight) {
                        continue;
                    }
                    const jsonState = stringify(cachedValue);
                    // FIXME: batch insert
                    await this.knex
                        .insert({
                        contract_id: contractTxId,
                        height: cachedHeight,
                        state: jsonState
                    })
                        .into('states')
                        .onConflict(['contract_id', 'height'])
                        .merge();
                    this.lastFlushHeight.set(contractTxId, cachedHeight);
                }
            }
            this.isDirty = false;
        }
        catch (e) {
            this.kLogger.error('Error while flushing cache', e);
        }
        finally {
            this.isFlushing = false;
            this.kLogger.info(`==== Cache persisted ====`);
        }
    }
    async put({ cacheKey, blockHeight }, value) {
        this.isDirty = true;
        return super.put({ cacheKey, blockHeight }, value);
    }
    async flush() {
        if (this.isFlushing || !this.isDirty) {
            return;
        }
        await this.saveCache();
    }
}
//# sourceMappingURL=KnexStateCache.js.map