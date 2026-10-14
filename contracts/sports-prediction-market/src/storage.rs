use soroban_sdk::{Address, Env};

use crate::types::{BetPosition, DataKey, Error, SportMarket};

// ── Admin / pause ─────────────────────────────────────────────────────────────

pub fn is_initialized(env: &Env) -> bool {
    env.storage().instance().has(&DataKey::Admin)
}

pub fn set_admin(env: &Env, admin: &Address) {
    env.storage().instance().set(&DataKey::Admin, admin);
}

pub fn get_admin(env: &Env) -> Result<Address, Error> {
    env.storage()
        .instance()
        .get(&DataKey::Admin)
        .ok_or(Error::NotInitialized)
}

pub fn is_paused(env: &Env) -> bool {
    env.storage()
        .instance()
        .get::<DataKey, bool>(&DataKey::Paused)
        .unwrap_or(false)
}

pub fn set_paused(env: &Env, paused: bool) {
    env.storage().instance().set(&DataKey::Paused, &paused);
}

// ── Market count ──────────────────────────────────────────────────────────────

pub fn get_market_count(env: &Env) -> u32 {
    env.storage()
        .instance()
        .get(&DataKey::MarketCount)
        .unwrap_or(0u32)
}

pub fn increment_market_count(env: &Env) -> u32 {
    let count = get_market_count(env) + 1;
    env.storage().instance().set(&DataKey::MarketCount, &count);
    count
}

// ── Markets ───────────────────────────────────────────────────────────────────

pub fn set_market(env: &Env, market: &SportMarket) {
    env.storage()
        .persistent()
        .set(&DataKey::Market(market.id), market);
}

pub fn get_market(env: &Env, id: u32) -> Result<SportMarket, Error> {
    env.storage()
        .persistent()
        .get(&DataKey::Market(id))
        .ok_or(Error::MarketNotFound)
}

// ── Positions ─────────────────────────────────────────────────────────────────

pub fn set_position(env: &Env, pos: &BetPosition) {
    env.storage()
        .persistent()
        .set(&DataKey::Position(pos.market_id, pos.bettor.clone()), pos);
}

pub fn get_position(env: &Env, market_id: u32, bettor: &Address) -> Option<BetPosition> {
    env.storage()
        .persistent()
        .get(&DataKey::Position(market_id, bettor.clone()))
}
