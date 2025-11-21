package com.lot86.practice_app_backend.repo;

import com.lot86.practice_app_backend.group.entity.AppGroup; // 1. AppGroup 엔티티 클래스를 가져와.
import org.springframework.data.jpa.repository.JpaRepository; // 2. JpaRepository 인터페이스를 가져와.

import java.util.UUID; // 3. AppGroup 엔티티의 ID 타입인 UUID를 가져와.

// 4. AppGroupRepository 인터페이스를 선언하고 JpaRepository를 상속받아.
//    JpaRepository<엔티티 클래스, ID 타입> 형태로 지정해줘.
public interface AppGroupRepository extends JpaRepository<AppGroup, UUID> {

    // 5. 여기에 필요한 커스텀 쿼리 메소드를 추가할 수 있어.
    //    예: 그룹 이름으로 그룹 찾기 (Optional<AppGroup> findByName(String name);)
    //    하지만 지금 당장은 기본적인 CRUD 기능만 필요하므로 비워둬도 돼.
    //    JpaRepository가 save(), findById(), findAll(), deleteById() 등을 이미 제공해줘.

}