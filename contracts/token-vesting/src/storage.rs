use soroban_sdk::{contracttype, Address, Env};

use crate::types::{Error, VestingSchedule};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Count,
    Schedule(u32),
}

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

pub fn next_id(env: &Env) -> u32 {
    let count: u32 = env
        .storage()
        .instance()
        .get(&DataKey::Count)
        .unwrap_or(0u32)
        + 1;
    env.storage().instance().set(&DataKey::Count, &count);
    count
}

pub fn get_count(env: &Env) -> u32 {
    env.storage()
        .instance()
        .get(&DataKey::Count)
        .unwrap_or(0u32)
}

pub fn save_schedule(env: &Env, s: &VestingSchedule) {
    env.storage().persistent().set(&DataKey::Schedule(s.id), s);
}

pub fn load_schedule(env: &Env, id: u32) -> Result<VestingSchedule, Error> {
    env.storage()
        .persistent()
        .get(&DataKey::Schedule(id))
        .ok_or(Error::ScheduleNotFound)
}
