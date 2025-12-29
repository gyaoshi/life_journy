/**
 * ObjectPool - 对象池管理器
 * 用于减少垃圾回收，提高性能，特别适用于频繁创建和销毁的对象
 */
class ObjectPool {
    constructor(createFn, resetFn, initialSize = 10) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        this.used = new Set();
        this.stats = {
            created: 0,
            reused: 0,
            maxPoolSize: 0,
            currentPoolSize: 0,
            activeObjects: 0
        };
        
        // 预填充对象池
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
            this.stats.created++;
        }
        
        this.stats.maxPoolSize = initialSize;
        this.stats.currentPoolSize = initialSize;
    }
    
    /**
     * 获取对象
     */
    acquire() {
        let obj;
        
        if (this.pool.length > 0) {
            obj = this.pool.pop();
            this.stats.reused++;
        } else {
            obj = this.createFn();
            this.stats.created++;
        }
        
        this.used.add(obj);
        this.stats.currentPoolSize = this.pool.length;
        this.stats.activeObjects = this.used.size;
        
        return obj;
    }
    
    /**
     * 释放对象
     */
    release(obj) {
        if (!this.used.has(obj)) {
            console.warn('Attempting to release object not acquired from this pool');
            return false;
        }
        
        this.used.delete(obj);
        
        // 重置对象状态
        if (this.resetFn) {
            this.resetFn(obj);
        }
        
        this.pool.push(obj);
        this.stats.currentPoolSize = this.pool.length;
        this.stats.activeObjects = this.used.size;
        
        // 更新最大池大小统计
        if (this.pool.length > this.stats.maxPoolSize) {
            this.stats.maxPoolSize = this.pool.length;
        }
        
        return true;
    }
    
    /**
     * 释放所有活跃对象
     */
    releaseAll() {
        const activeObjects = Array.from(this.used);
        activeObjects.forEach(obj => this.release(obj));
        return activeObjects.length;
    }
    
    /**
     * 清空对象池
     */
    clear() {
        this.releaseAll();
        this.pool = [];
        this.used.clear();
        this.stats.currentPoolSize = 0;
        this.stats.activeObjects = 0;
    }
    
    /**
     * 获取统计信息
     */
    getStats() {
        return { ...this.stats };
    }
    
    /**
     * 获取效率比率
     */
    getEfficiencyRatio() {
        const total = this.stats.created + this.stats.reused;
        return total > 0 ? this.stats.reused / total : 0;
    }
}

/**
 * ObjectPoolManager - 对象池管理器
 * 管理多个对象池，提供统一的接口
 */
class ObjectPoolManager {
    constructor() {
        this.pools = new Map();
        this.globalStats = {
            totalPools: 0,
            totalObjectsCreated: 0,
            totalObjectsReused: 0,
            memoryEstimate: 0
        };
        
        console.log('ObjectPoolManager initialized');
    }
    
    /**
     * 创建对象池
     */
    createPool(name, createFn, resetFn, initialSize = 10) {
        if (this.pools.has(name)) {
            console.warn(`Pool '${name}' already exists`);
            return this.pools.get(name);
        }
        
        const pool = new ObjectPool(createFn, resetFn, initialSize);
        this.pools.set(name, pool);
        this.globalStats.totalPools++;
        
        console.log(`Created object pool '${name}' with initial size ${initialSize}`);
        return pool;
    }
    
    /**
     * 获取对象池
     */
    getPool(name) {
        return this.pools.get(name);
    }
    
    /**
     * 从指定池获取对象
     */
    acquire(poolName) {
        const pool = this.pools.get(poolName);
        if (!pool) {
            throw new Error(`Pool '${poolName}' not found`);
        }
        return pool.acquire();
    }
    
    /**
     * 释放对象到指定池
     */
    release(poolName, obj) {
        const pool = this.pools.get(poolName);
        if (!pool) {
            throw new Error(`Pool '${poolName}' not found`);
        }
        return pool.release(obj);
    }
    
    /**
     * 删除对象池
     */
    removePool(name) {
        const pool = this.pools.get(name);
        if (pool) {
            pool.clear();
            this.pools.delete(name);
            this.globalStats.totalPools--;
            console.log(`Removed object pool '${name}'`);
            return true;
        }
        return false;
    }
    
    /**
     * 获取全局统计信息
     */
    getGlobalStats() {
        this.updateGlobalStats();
        return { ...this.globalStats };
    }
    
    /**
     * 更新全局统计信息
     */
    updateGlobalStats() {
        let totalCreated = 0;
        let totalReused = 0;
        let memoryEstimate = 0;
        
        this.pools.forEach((pool, name) => {
            const stats = pool.getStats();
            totalCreated += stats.created;
            totalReused += stats.reused;
            memoryEstimate += stats.currentPoolSize * 100; // 估算每个对象100字节
        });
        
        this.globalStats.totalObjectsCreated = totalCreated;
        this.globalStats.totalObjectsReused = totalReused;
        this.globalStats.memoryEstimate = memoryEstimate;
    }
    
    /**
     * 获取所有池的详细统计
     */
    getAllPoolStats() {
        const stats = {};
        this.pools.forEach((pool, name) => {
            stats[name] = {
                ...pool.getStats(),
                efficiency: pool.getEfficiencyRatio()
            };
        });
        return stats;
    }
    
    /**
     * 清理所有对象池
     */
    clearAll() {
        this.pools.forEach((pool, name) => {
            pool.clear();
        });
        console.log('All object pools cleared');
    }
    
    /**
     * 优化所有对象池
     */
    optimize() {
        let optimized = 0;
        
        this.pools.forEach((pool, name) => {
            const stats = pool.getStats();
            
            // 如果池中有太多未使用的对象，减少池大小
            if (pool.pool.length > stats.activeObjects * 2 && pool.pool.length > 10) {
                const removeCount = Math.floor(pool.pool.length / 2);
                pool.pool.splice(0, removeCount);
                optimized++;
                console.log(`Optimized pool '${name}': removed ${removeCount} unused objects`);
            }
        });
        
        return optimized;
    }
    
    /**
     * 生成性能报告
     */
    generatePerformanceReport() {
        this.updateGlobalStats();
        
        const report = {
            summary: {
                totalPools: this.globalStats.totalPools,
                totalObjectsCreated: this.globalStats.totalObjectsCreated,
                totalObjectsReused: this.globalStats.totalObjectsReused,
                overallEfficiency: this.globalStats.totalObjectsCreated > 0 ? 
                    this.globalStats.totalObjectsReused / (this.globalStats.totalObjectsCreated + this.globalStats.totalObjectsReused) : 0,
                estimatedMemoryUsage: `${(this.globalStats.memoryEstimate / 1024).toFixed(2)} KB`
            },
            poolDetails: this.getAllPoolStats(),
            recommendations: this.getOptimizationRecommendations()
        };
        
        return report;
    }
    
    /**
     * 获取优化建议
     */
    getOptimizationRecommendations() {
        const recommendations = [];
        
        this.pools.forEach((pool, name) => {
            const stats = pool.getStats();
            const efficiency = pool.getEfficiencyRatio();
            
            if (efficiency < 0.5 && stats.created > 20) {
                recommendations.push({
                    pool: name,
                    type: 'low_efficiency',
                    message: `Pool '${name}' has low efficiency (${(efficiency * 100).toFixed(1)}%)`,
                    suggestion: 'Consider increasing initial pool size or reviewing object lifecycle'
                });
            }
            
            if (pool.pool.length > stats.activeObjects * 3) {
                recommendations.push({
                    pool: name,
                    type: 'oversized',
                    message: `Pool '${name}' may be oversized`,
                    suggestion: 'Consider reducing pool size or implementing automatic cleanup'
                });
            }
            
            if (stats.activeObjects > stats.maxPoolSize * 2) {
                recommendations.push({
                    pool: name,
                    type: 'undersized',
                    message: `Pool '${name}' may be undersized`,
                    suggestion: 'Consider increasing initial pool size'
                });
            }
        });
        
        return recommendations;
    }
}

// 创建全局对象池管理器实例
const globalObjectPoolManager = new ObjectPoolManager();

// 预定义一些常用的对象池
if (typeof window !== 'undefined') {
    // 事件对象池
    globalObjectPoolManager.createPool('events', 
        () => ({ id: null, type: null, x: 0, y: 0, timestamp: 0, data: null }),
        (obj) => {
            obj.id = null;
            obj.type = null;
            obj.x = 0;
            obj.y = 0;
            obj.timestamp = 0;
            obj.data = null;
        },
        20
    );
    
    // 粒子对象池
    globalObjectPoolManager.createPool('particles',
        () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 1, maxLife: 1, color: '#ffffff', size: 1 }),
        (obj) => {
            obj.x = 0;
            obj.y = 0;
            obj.vx = 0;
            obj.vy = 0;
            obj.life = 1;
            obj.maxLife = 1;
            obj.color = '#ffffff';
            obj.size = 1;
        },
        50
    );
    
    // 向量对象池
    globalObjectPoolManager.createPool('vectors',
        () => ({ x: 0, y: 0 }),
        (obj) => {
            obj.x = 0;
            obj.y = 0;
        },
        30
    );
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ObjectPool, ObjectPoolManager, globalObjectPoolManager };
} else if (typeof window !== 'undefined') {
    window.ObjectPool = ObjectPool;
    window.ObjectPoolManager = ObjectPoolManager;
    window.globalObjectPoolManager = globalObjectPoolManager;
}