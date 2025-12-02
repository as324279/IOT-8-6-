package com.lot86.practice_app_backend.inventory.service;

import com.lot86.practice_app_backend.entity.AppUser;
import com.lot86.practice_app_backend.group.entity.GroupMember;
import com.lot86.practice_app_backend.group.repo.GroupMemberRepository;
import com.lot86.practice_app_backend.inventory.entity.Item;
import com.lot86.practice_app_backend.inventory.repo.ItemRepository;
import com.lot86.practice_app_backend.notification.service.NotificationService;
import com.lot86.practice_app_backend.repo.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ItemScheduler {

    private final ItemRepository itemRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final AppUserRepository userRepository;
    private final NotificationService notificationService;

    // "매일 아침 9시 0분 0초에 작동해라!" (초 분 시 일 월 요일)
    @Scheduled(cron = "0 0 9 * * *")
    // 테스트용: 5초 뒤 시작, 이후 1분마다 실행
    //@Scheduled(initialDelay = 5000, fixedRate = 60000)
    @Transactional
    public void checkExpiryDateAndNotify() {
        System.out.println("🤖 [스케줄러] 유통기한 검사 로봇이 일어났습니다!");

        LocalDate today = LocalDate.now(); // 오늘 날짜
        LocalDate threeDaysLater = today.plusDays(3); // 3일 뒤 날짜

        // 1. "오늘부터 3일 뒤 사이에 유통기한이 끝나는 물건 다 가져와!"
        List<Item> expiringItems = itemRepository.findByExpiryDateBetweenAndStatus(today, threeDaysLater, "ACTIVE");

        System.out.println("📦 [스케줄러] 임박한 물건 " + expiringItems.size() + "개를 발견했습니다.");

        // 2. 발견된 물건 하나하나마다 알림 보내기
        for (Item item : expiringItems) {
            sendExpiryNotification(item);
        }
    }

    // 🔔 알림 보내는 심부름꾼 함수
    private void sendExpiryNotification(Item item) {
        try {
            // 1. 이 물건이 있는 그룹의 ID를 알아내고
            UUID groupId = item.getGroup().getGroupId();

            // 2. 그 그룹에 살고 있는 멤버들을 다 찾아서
            List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
            List<UUID> userIds = members.stream().map(GroupMember::getUserId).toList();
            List<AppUser> targets = userRepository.findAllById(userIds);

            // 3. 한 명씩 "빨리 드세요!" 라고 문자(알림)를 남김
            String title = "유통기한 임박 알림 ⏳";
            String body = String.format("'%s'의 유통기한이 %s까지입니다. 빨리 드세요!",
                    item.getName(), item.getExpiryDate());

            for (AppUser target : targets) {
                notificationService.createNotification(target, "EXPIRY_SOON", title, body);
            }
        } catch (Exception e) {
            System.err.println("알림 보내다가 넘어졌어요 ㅠㅠ : " + e.getMessage());
        }
    }
}