// Plan It - Application Core Control

document.addEventListener("DOMContentLoaded", () => {
  // Application State
  const state = {
    nickname: "민우",
    hometown: "",
    hometownCoords: null,
    profilePic: null,
    preferredTags: [],
    nonPreferredTags: [],
    
    // Simulation state
    isJoined: false,
    calculatedMidpoint: null,
    selectedCourse: null,
    archiveRecords: [], // List of saved meetings
    activeArchiveRecord: null // Currently viewed archive details
  };

  // DOM Elements
  const screenIntro = document.getElementById("screen-intro");
  const btnKakaoStart = document.getElementById("btn-kakao-start");
  const appHeaderUser = document.getElementById("app-header-user");
  
  // Tab Elements
  const tabMyInfo = document.getElementById("tab-my-info");
  const tabMainView = document.getElementById("tab-main-view");
  const tabArchive = document.getElementById("tab-archive");
  
  // Toolbar Buttons
  const navMyInfo = document.getElementById("nav-my-info");
  const navMainView = document.getElementById("nav-main-view");
  const navArchive = document.getElementById("nav-archive");

  // MY 정보 Panel Elements
  const profileAvatarClickable = document.getElementById("profile-avatar-clickable");
  const profilePicInput = document.getElementById("profile-pic-input");
  const inputNickname = document.getElementById("input-nickname");
  const inputHometown = document.getElementById("input-hometown");
  const hometownSuggestions = document.getElementById("hometown-suggestions");
  const preferredTagsContainer = document.getElementById("preferred-tags-container");
  const nonPreferredTagsContainer = document.getElementById("non-preferred-tags-container");
  const btnStartExploration = document.getElementById("btn-start-exploration");

  // MAIN 화면 Panel Elements
  const hostMemberAvatar = document.getElementById("host-member-avatar");
  const hostMemberName = document.getElementById("host-member-name");
  const hostMemberStation = document.getElementById("host-member-station");
  const btnCalculateGalaxyNode = document.getElementById("btn-calculate-galaxy-node");
  const galaxyMergingLoader = document.getElementById("galaxy-merging-loader");
  const spinningHostNode = document.getElementById("spinning-host-node");
  const discoveredMidpointBanner = document.getElementById("discovered-midpoint-banner");
  const midpointStationText = document.getElementById("midpoint-station-text");
  const midpointStationDesc = document.getElementById("midpoint-station-desc");
  const courseOptionsContainer = document.getElementById("course-options-container");
  const courseCardsPool = document.getElementById("course-cards-pool");
  const btnSaveSelectedCourse = document.getElementById("btn-save-selected-course");
  const courseSuccessPopupView = document.getElementById("course-success-popup-view");
  const savedCourseNameDisplay = document.getElementById("saved-course-name-display");
  const btnShareToKakaotalk = document.getElementById("btn-share-to-kakaotalk");
  const btnPopupGotoArchive = document.getElementById("btn-popup-goto-archive");
  const btnPopupResetCourse = document.getElementById("btn-popup-reset-course");

  // Archive Elements
  const archiveEmptyView = document.getElementById("archive-empty-view");
  const archiveListContainer = document.getElementById("archive-list-container");
  const archiveDetailPanel = document.getElementById("archive-detail-panel");
  const archiveDetailTitle = document.getElementById("archive-detail-title");
  const archiveDetailCourseSummary = document.getElementById("archive-detail-course-summary");
  const photoUploaderSlots = document.getElementById("photo-uploader-slots");
  const btnBackToArchiveList = document.getElementById("btn-back-to-archive-list");

  // Common UI Elements
  const popupValidation = document.getElementById("popup-validation");
  const appToastNotice = document.getElementById("app-toast-notice");

  // --- Step 1: Kakao Login Click ---
  btnKakaoStart.addEventListener("click", () => {
    // Hide intro screen
    screenIntro.classList.add("hidden");
    
    // Set user header
    appHeaderUser.innerText = state.nickname;
    
    // Move to Main tab 2-2 by default
    switchTab("main-view");
    showToast("카카오 간편 로그인 성공!");
  });

  // --- Tab Navigation Control ---
  function switchTab(tabId) {
    // Hide all tab contents
    tabMyInfo.classList.remove("active");
    tabMainView.classList.remove("active");
    tabArchive.classList.remove("active");
    
    // Remove active from all toolbar buttons
    navMyInfo.classList.remove("active");
    navMainView.classList.remove("active");
    navArchive.classList.remove("active");
    
    // Sync UI to active tab
    if (tabId === "my-info") {
      tabMyInfo.classList.add("active");
      navMyInfo.classList.add("active");
    } else if (tabId === "main-view") {
      tabMainView.classList.add("active");
      navMainView.classList.add("active");
      updateHostBadge(); // Sync inputs
    } else if (tabId === "archive") {
      tabArchive.classList.add("active");
      navArchive.classList.add("active");
      renderArchiveTab();
    }
  }

  navMyInfo.addEventListener("click", () => switchTab("my-info"));
  navMainView.addEventListener("click", () => switchTab("main-view"));
  navArchive.addEventListener("click", () => switchTab("archive"));

  // Update Me's badge in Main 화면
  function updateHostBadge() {
    if (state.nickname && state.hometown) {
      hostMemberName.innerText = state.nickname;
      hostMemberStation.innerText = state.hometown;
      
      if (state.profilePic) {
        hostMemberAvatar.innerHTML = `<img src="${state.profilePic}" alt="Me">`;
        spinningHostNode.innerHTML = `<img src="${state.profilePic}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
      } else {
        const char = state.nickname.charAt(0);
        hostMemberAvatar.innerText = char;
        spinningHostNode.innerText = char;
      }
    } else {
      hostMemberName.innerText = "나 (미등록)";
      hostMemberStation.innerText = "미등록역";
      hostMemberAvatar.innerText = "?";
      spinningHostNode.innerText = "나";
    }
  }

  // --- MY 정보 Event Handlers ---
  
  // Avatar upload trigger
  profileAvatarClickable.addEventListener("click", () => profilePicInput.click());
  document.getElementById("btn-edit-avatar").addEventListener("click", () => profilePicInput.click());

  profilePicInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = function(event) {
        state.profilePic = event.target.result;
        profileAvatarClickable.innerHTML = `<img src="${state.profilePic}" alt="Uploaded Profile">`;
        updateHostBadge();
        showToast("프로필 이미지가 변경되었습니다.");
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  });

  // Bind inputs to State
  inputNickname.addEventListener("input", (e) => {
    state.nickname = e.target.value.trim();
    appHeaderUser.innerText = state.nickname || "게스트";
  });

  // Hometown Input autocomplete
  inputHometown.addEventListener("input", (e) => {
    const val = e.target.value.trim();
    hometownSuggestions.innerHTML = "";
    state.hometown = val;
    
    if (!val) {
      hometownSuggestions.style.display = "none";
      return;
    }

    // Match starting station coords keys
    const matches = Object.keys(STATION_COORDS).filter(station => 
      station.includes(val) && !["신논현역", "잠실역", "고속터미널역"].includes(station)
    );

    if (matches.length === 0) {
      hometownSuggestions.style.display = "none";
      return;
    }

    matches.forEach(station => {
      const item = document.createElement("div");
      item.className = "light-suggestion-item";
      item.innerText = station;
      item.addEventListener("click", () => {
        inputHometown.value = station;
        state.hometown = station;
        state.hometownCoords = STATION_COORDS[station];
        hometownSuggestions.style.display = "none";
      });
      hometownSuggestions.appendChild(item);
    });

    hometownSuggestions.style.display = "block";
  });

  // Hide suggestion list when click elsewhere
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".edit-input-group")) {
      hometownSuggestions.style.display = "none";
    }
  });

  // Preference Tag selection
  preferredTagsContainer.addEventListener("click", (e) => {
    const pill = e.target.closest(".tag-pill");
    if (!pill) return;

    const val = pill.getAttribute("data-val");
    if (pill.classList.contains("selected")) {
      pill.classList.remove("selected");
      state.preferredTags = state.preferredTags.filter(t => t !== val);
    } else {
      if (state.preferredTags.length >= 3) {
        showToast("선호 취향은 최대 3개까지 선택 가능합니다.");
        return;
      }
      pill.classList.add("selected");
      state.preferredTags.push(val);
    }
  });

  // Non-preferred Tag selection
  nonPreferredTagsContainer.addEventListener("click", (e) => {
    const pill = e.target.closest(".tag-pill");
    if (!pill) return;

    const val = pill.getAttribute("data-val");
    if (pill.classList.contains("selected")) {
      pill.classList.remove("selected");
      state.nonPreferredTags = state.nonPreferredTags.filter(t => t !== val);
    } else {
      if (state.nonPreferredTags.length >= 3) {
        showToast("비선호 취향은 최대 3개까지 선택 가능합니다.");
        return;
      }
      pill.classList.add("selected");
      state.nonPreferredTags.push(val);
    }
  });

  // Space Exploration Invite Link Generation
  btnStartExploration.addEventListener("click", () => {
    if (!state.nickname || !state.hometown) {
      showToast("닉네임과 사는 곳 지하철역을 완성해주세요.");
      return;
    }

    state.isJoined = true;
    
    // Copy invite link mock
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const mockLink = `https://planit.io/join/galaxy-${randomCode}`;
    
    navigator.clipboard.writeText(mockLink).then(() => {
      showToast("초대 링크 복사 완료! 단톡방 친구들에게 전송하세요.");
    }).catch(() => {
      showToast("복사 실패. 수동으로 링크를 발송하세요.");
    });
  });


  // --- SCREEN 2-2: MAIN 화면 Event Handlers ---
  btnCalculateGalaxyNode.addEventListener("click", () => {
    // 1. Validation Check: Did host enter nickname & hometown?
    if (!state.nickname || !state.hometown) {
      // Trigger Validation Modal
      popupValidation.classList.add("open");
      
      // Delay 3 seconds then redirect to MY 정보
      setTimeout(() => {
        popupValidation.classList.remove("open");
        switchTab("my-info");
      }, 3000);
      
      return;
    }

    // 2. Perform Spin & Merge animation
    btnCalculateGalaxyNode.style.display = "none";
    galaxyMergingLoader.style.display = "flex";
    discoveredMidpointBanner.style.display = "none";
    courseOptionsContainer.style.display = "none";

    setTimeout(() => {
      galaxyMergingLoader.style.display = "none";
      
      // Calculate real midpoint mathematically based on average coordinate
      computeMidpointNode();
      
      discoveredMidpointBanner.style.display = "block";
      courseOptionsContainer.style.display = "block";
      
      showToast("은하 거점 도출이 완료되었습니다!");
    }, 3200);
  });

  function computeMidpointNode() {
    // Calculate host coordinate
    const hostCoords = state.hometownCoords || STATION_COORDS[state.hometown] || STATION_COORDS["강남역"]; // fallback
    
    // Sum all members coords
    let sumLat = hostCoords.lat;
    let sumLng = hostCoords.lng;
    
    MOCK_FRIENDS.forEach(friend => {
      sumLat += friend.lat;
      sumLng += friend.lng;
    });

    const avgLat = sumLat / 5;
    const avgLng = sumLng / 5;

    // Compare with Sinnonhyeon, Jamsil, Express Bus Terminal
    const options = ["신논현역", "잠실역", "고속터미널역"];
    let closestStation = options[0];
    let minDistance = Infinity;

    options.forEach(stationName => {
      const coords = STATION_COORDS[stationName];
      const dist = Math.sqrt(Math.pow(coords.lat - avgLat, 2) + Math.pow(coords.lng - avgLng, 2));
      if (dist < minDistance) {
        minDistance = dist;
        closestStation = stationName;
      }
    });

    state.calculatedMidpoint = closestStation;
    const stationInfo = STATION_COORDS[closestStation];

    // Populate Midpoint Banner
    midpointStationText.innerText = closestStation;
    midpointStationDesc.innerText = `${stationInfo.desc} (교통 공평 편차율 최적화)`;

    // Populate course list
    renderCourseOptions(closestStation);
  }

  function renderCourseOptions(stationName) {
    courseCardsPool.innerHTML = "";
    btnSaveSelectedCourse.setAttribute("disabled", "true");
    courseSuccessPopupView.style.display = "none";
    state.selectedCourse = null;

    const courses = REAL_COURSES[stationName];
    courses.forEach(course => {
      const card = document.createElement("div");
      card.className = "course-option-card";
      card.setAttribute("data-id", course.id);

      let stepsHtml = "";
      course.places.forEach(place => {
        stepsHtml += `
          <div class="step-badge">
            <span class="step-badge-num">${place.type}</span>
            <span class="step-badge-name">${place.name}</span>
          </div>
        `;
      });

      card.innerHTML = `
        <div class="course-option-title">${course.name}</div>
        <div class="course-timeline-steps">
          ${stepsHtml}
        </div>
      `;

      card.addEventListener("click", () => {
        // Toggle selected state
        document.querySelectorAll(".course-option-card").forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");

        state.selectedCourse = course;
        btnSaveSelectedCourse.removeAttribute("disabled");
      });

      courseCardsPool.appendChild(card);
    });
  }

  // Hook save selected course button
  btnSaveSelectedCourse.addEventListener("click", () => {
    if (!state.selectedCourse || !state.calculatedMidpoint) return;

    // Save to archives list
    saveToArchiveRecords(state.selectedCourse, state.calculatedMidpoint);

    // Hide course list selection, show success popup view
    courseOptionsContainer.style.display = "none";
    courseSuccessPopupView.style.display = "block";
    savedCourseNameDisplay.innerText = `${state.selectedCourse.name} 코스가 은하계에 기록되었습니다.`;
    
    showToast("코스가 아카이브에 성공적으로 저장되었습니다!");
  });

  // Popup navigation buttons
  btnPopupGotoArchive.addEventListener("click", () => {
    switchTab("archive");
  });

  btnPopupResetCourse.addEventListener("click", () => {
    // Hide popup success, show options container
    courseSuccessPopupView.style.display = "none";
    courseOptionsContainer.style.display = "block";
  });

  function saveToArchiveRecords(course, stationName) {
    const today = new Date();
    const formattedDate = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
    
    const recordId = `record-${stationName}-${formattedDate}`;
    
    // Check if record already exists
    const exists = state.archiveRecords.find(rec => rec.id === recordId);
    if (!exists) {
      state.archiveRecords.push({
        id: recordId,
        date: formattedDate,
        stationName: stationName,
        courseName: course.name,
        places: course.places.map(place => ({
          type: place.type,
          name: place.name,
          desc: place.desc,
          address: place.address,
          photo: null // Will be uploaded inside Screen 2-3
        }))
      });
    } else {
      // Overwrite chosen course if they switch
      exists.courseName = course.name;
      exists.places = course.places.map(place => ({
        type: place.type,
        name: place.name,
        desc: place.desc,
        address: place.address,
        photo: null
      }));
    }
  }

  btnShareToKakaotalk.addEventListener("click", () => {
    if (!state.selectedCourse || !state.calculatedMidpoint) return;

    const courseNames = state.selectedCourse.places.map(p => p.name).join(" ➔ ");
    const shareMessage = `[Plan It] 우주선 도킹 완료! 최적 거점인 [${state.calculatedMidpoint}]에서 만나요.\n🚀 확정 코스: ${state.selectedCourse.name}\n📍 경로: ${courseNames}\n시간 맞춰 우주선 탑승 바람! 🌌`;

    navigator.clipboard.writeText(shareMessage).then(() => {
      showToast("코스 카톡 소환 멘트 복사 완료! 단톡방에 붙여넣으세요.");
    });
  });


  // --- SCREEN 2-3: 추억 아카이브 Event Handlers ---
  function renderArchiveTab() {
    // Hide details view, go back to list by default
    archiveDetailPanel.style.display = "none";
    
    if (state.archiveRecords.length === 0) {
      archiveEmptyView.style.display = "flex";
      archiveListContainer.style.display = "none";
    } else {
      archiveEmptyView.style.display = "none";
      archiveListContainer.style.display = "block";
      
      archiveListContainer.innerHTML = "";
      state.archiveRecords.forEach(record => {
        const item = document.createElement("div");
        item.className = "archive-list-item";
        item.innerHTML = `
          <div>
            <div class="archive-list-item-title">${record.stationName} 기록 행성</div>
            <div style="font-size: 11px; color: var(--gray-text); margin-top: 3px;">
              ${record.courseName.split(": ")[1]}
            </div>
          </div>
          <span class="archive-list-item-date">${record.date}</span>
        `;

        item.addEventListener("click", () => {
          openArchiveDetails(record);
        });

        archiveListContainer.appendChild(item);
      });
    }
  }

  function openArchiveDetails(record) {
    state.activeArchiveRecord = record;
    archiveListContainer.style.display = "none";
    archiveDetailPanel.style.display = "block";

    archiveDetailTitle.innerText = `${record.stationName} 기록 행성`;
    
    const summaryText = record.places.map(p => p.name).join(" ➔ ");
    archiveDetailCourseSummary.innerText = `코스 경로: ${summaryText}`;

    // Populate photo uploader slots
    photoUploaderSlots.innerHTML = "";
    
    record.places.forEach((place, index) => {
      const uploader = document.createElement("div");
      uploader.className = "uploader-card";
      uploader.setAttribute("data-index", index);

      let innerHtml = `
        <div class="uploader-card-info">
          <span class="uploader-card-title">${place.type} - ${place.name}</span>
          <span class="uploader-card-desc">${place.desc}</span>
        </div>
        <svg class="uploader-icon" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3.2"/>
          <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
        </svg>
      `;

      if (place.photo) {
        innerHtml += `<img src="${place.photo}" class="uploader-preview-img" alt="Place Photo">`;
      }

      uploader.innerHTML = innerHtml;

      uploader.addEventListener("click", () => {
        // Create an input file element dynamically to handle uploads for this slot
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        
        fileInput.addEventListener("change", (event) => {
          if (event.target.files && event.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(evt) {
              place.photo = evt.target.result;
              
              // Rerender details
              openArchiveDetails(record);
              showToast(`${place.name} 방문 인증 완료!`);
            };
            reader.readAsDataURL(event.target.files[0]);
          }
        });

        fileInput.click();
      });

      photoUploaderSlots.appendChild(uploader);
    });
  }

  btnBackToArchiveList.addEventListener("click", () => {
    state.activeArchiveRecord = null;
    renderArchiveTab();
  });


  // --- Common Helper Functions ---
  
  // Show app toast notice
  function showToast(message) {
    appToastNotice.innerText = message;
    appToastNotice.classList.add("show");

    if (window.toastTimeout) clearTimeout(window.toastTimeout);

    window.toastTimeout = setTimeout(() => {
      appToastNotice.classList.remove("show");
    }, 4000);
  }
});
