module attendance_nft::attendance {
    use std::signer;
    use std::string;
    use aptos_framework::account;
    use aptos_framework::aptos_coin;
    use aptos_framework::coin;
    use aptos_token::token;
    use aptos_token::token_transfers;

    struct AttendanceRecord has key {
        student_id: string::String,
        course_code: string::String,
        timestamp: u64,
        nft_id: string::String,
    }

    struct AttendanceStore has key {
        records: vector<AttendanceRecord>,
    }

    const E_NOT_INITIALIZED: u64 = 1;
    const E_ALREADY_INITIALIZED: u64 = 2;
    const E_NOT_ENOUGH_BALANCE: u64 = 3;
    const E_RECORD_NOT_FOUND: u64 = 4;

    public entry fun initialize(account: &signer) {
        let account_addr = signer::address_of(account);
        assert!(!exists<AttendanceStore>(account_addr), E_ALREADY_INITIALIZED);
        
        move_to(account, AttendanceStore {
            records: vector::empty(),
        });
    }

    public entry fun mark_attendance(
        account: &signer,
        student_id: string::String,
        course_code: string::String,
    ) acquires AttendanceStore {
        let account_addr = signer::address_of(account);
        assert!(exists<AttendanceStore>(account_addr), E_NOT_INITIALIZED);

        let store = borrow_global_mut<AttendanceStore>(account_addr);
        let timestamp = aptos_framework::timestamp::now_seconds();
        let nft_id = string::utf8(b"ATTENDANCE_NFT_") + string::utf8(b"") + string::to_string(&timestamp);

        // Create new attendance record
        let record = AttendanceRecord {
            student_id,
            course_code,
            timestamp,
            nft_id,
        };

        // Add record to store
        vector::push_back(&mut store.records, record);

        // Mint NFT
        let token_name = string::utf8(b"Attendance NFT");
        let token_description = string::utf8(b"Proof of attendance");
        let token_uri = string::utf8(b"https://attendance.nft/metadata/") + nft_id;

        token::create_token_data(
            account,
            token_name,
            token_description,
            token_uri,
            1,
            vector::empty(),
            vector::empty(),
        );

        // Transfer NFT to student
        token_transfers::offer(
            account,
            account_addr,
            token_name,
            1,
        );
    }

    public fun verify_attendance(
        account_addr: address,
        student_id: string::String,
        course_code: string::String,
    ): bool acquires AttendanceStore {
        assert!(exists<AttendanceStore>(account_addr), E_NOT_INITIALIZED);
        let store = borrow_global<AttendanceStore>(account_addr);
        
        let i = 0;
        while (i < vector::length(&store.records)) {
            let record = vector::borrow(&store.records, i);
            if (string::equals(&record.student_id, &student_id) && 
                string::equals(&record.course_code, &course_code)) {
                return true;
            };
            i = i + 1;
        };
        false
    }

    public fun get_attendance_records(
        account_addr: address,
    ): vector<AttendanceRecord> acquires AttendanceStore {
        assert!(exists<AttendanceStore>(account_addr), E_NOT_INITIALIZED);
        let store = borrow_global<AttendanceStore>(account_addr);
        store.records
    }
} 