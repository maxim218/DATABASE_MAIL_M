CREATE OR REPLACE FUNCTION registrate_student(student_about_param TEXT, student_email_param TEXT, student_fullname_param TEXT, student_nickname_param TEXT) RETURNS TEXT AS $$
    DECLARE student_record student_type;
    DECLARE n INTEGER;
    DECLARE students_array student_type ARRAY;
BEGIN
    n = 0;
    FOR student_record IN SELECT * FROM student WHERE LOWER(student_email) = LOWER(student_email_param) OR LOWER(student_nickname) = LOWER(student_nickname_param) LIMIT 2 LOOP
        n = n + 1;
        students_array[n] = student_record;
    END LOOP;
    IF (n > 0) THEN
        RETURN array_to_json(students_array);
    END IF;
    INSERT INTO student (student_about, student_email, student_fullname, student_nickname) VALUES (student_about_param, student_email_param, student_fullname_param, student_nickname_param);
    RETURN 'INSERT_STUDENT_OK';
END;
$$ LANGUAGE plpgsql;

/**********************************************/

CREATE OR REPLACE FUNCTION information_student (student_nickname_param TEXT) RETURNS TEXT AS $$
    DECLARE student_record student_type;
    DECLARE n INTEGER;
    DECLARE students_array student_type ARRAY;
BEGIN
    n = 0;
    FOR student_record IN SELECT * FROM student WHERE LOWER(student_nickname) = LOWER(student_nickname_param) LIMIT 1 LOOP
        n = n + 1;
        students_array[n] = student_record;
    END LOOP;
    IF (n > 0) THEN
        RETURN array_to_json(students_array);
    END IF;
    RETURN 'STUDENT_NOT_FOUND';
END;
$$ LANGUAGE plpgsql;

/**********************************************/

CREATE OR REPLACE FUNCTION find_student_number(student_nickname_param TEXT) RETURNS INTEGER AS $$
    DECLARE n INTEGER;
    DECLARE student_record student_type;
BEGIN
    n = -1;
    FOR student_record IN SELECT student_id FROM student WHERE LOWER(student_nickname) = LOWER(student_nickname_param) LIMIT 1 LOOP
        n = student_record.student_id;
    END LOOP;
    RETURN n;
END;
$$ LANGUAGE plpgsql;

/**********************************************/

CREATE OR REPLACE FUNCTION find_student_login(student_id_param INTEGER) RETURNS TEXT AS $$
    DECLARE s TEXT;
    DECLARE student_record RECORD;
BEGIN
    s = 'LOGIN_NOT_FOUND';
    FOR student_record IN SELECT student_id, student_nickname FROM student WHERE student_id = student_id_param LIMIT 1 LOOP
        s = student_record.student_nickname;
    END LOOP;
    RETURN s;
END;
$$ LANGUAGE plpgsql;

/**********************************************/

CREATE OR REPLACE FUNCTION create_new_forum(slug_param TEXT, title_param TEXT, nickname_param TEXT) RETURNS TEXT AS $$
    DECLARE student_record student_type;
    DECLARE student_number INTEGER;
    DECLARE forum_exists BOOLEAN;
    DECLARE forum_record forum_type;
    DECLARE answer_forum_record forum_type;
    DECLARE student_nickname TEXT;
BEGIN
    student_number = find_student_number(nickname_param);
    IF(student_number = -1) THEN
        RETURN 'STUDENT_NOT_FOUND';
    END IF;
    student_nickname = find_student_login(student_number);
    forum_exists = False;
    FOR forum_record IN SELECT * FROM forum WHERE LOWER(forum_slug) = LOWER(slug_param) LIMIT 1 LOOP
        forum_exists = True;
        answer_forum_record = forum_record;
    END LOOP;
    IF (forum_exists = True) THEN
        RETURN to_json(answer_forum_record);
    END IF;
    INSERT INTO forum(forum_posts, forum_slug, forum_threads, forum_title, forum_user_nickname, forum_user_id)
    VALUES (0, slug_param, 0, title_param, student_nickname, student_number);
    RETURN student_nickname;
END;
$$ LANGUAGE plpgsql;

/**********************************************/

CREATE OR REPLACE FUNCTION update_student_information(student_about_param TEXT, student_email_param TEXT, student_fullname_param TEXT, student_nickname_param TEXT) RETURNS TEXT AS $$
    DECLARE student_number INTEGER;
    DECLARE student_record student_type;
    DECLARE hit_email BOOLEAN;
    DECLARE students_array student_type ARRAY;
    DECLARE n INTEGER;
BEGIN
    student_number = find_student_number(student_nickname_param);
    IF (student_number = -1) THEN
        RETURN 'STUDENT_NOT_EXISTS';
    END IF;
    hit_email = False;
    FOR student_record IN SELECT student_id, student_email FROM student WHERE LOWER(student_email) = LOWER(student_email_param) AND student_id != student_number LIMIT 1 LOOP
        hit_email = True;
    END LOOP;
    IF (hit_email = True) THEN
        RETURN 'STUDENT_CONFLICT_EMAIL';
    END IF;
    IF (student_about_param != '@@@_NOT_CHANGE') THEN UPDATE student SET student_about = student_about_param WHERE student_id = student_number; END IF;
    IF (student_email_param != '@@@_NOT_CHANGE') THEN UPDATE student SET student_email = student_email_param WHERE student_id = student_number; END IF;
    IF (student_fullname_param != '@@@_NOT_CHANGE') THEN UPDATE student SET student_fullname = student_fullname_param WHERE student_id = student_number; END IF;
    n = 0;
    FOR student_record IN SELECT * FROM student WHERE student_id = student_number LIMIT 1 LOOP
        n = n + 1;
        students_array[n] = student_record;
    END LOOP;
    RETURN array_to_json(students_array);
END;
$$ LANGUAGE plpgsql;

/**********************************************/

CREATE OR REPLACE FUNCTION find_forum_id(forum_slug_param TEXT) RETURNS INTEGER AS $$
    DECLARE forum_record RECORD;
    DECLARE n INTEGER;
BEGIN
    n = -1;
    FOR forum_record IN SELECT forum_id, forum_slug FROM forum WHERE LOWER(forum_slug) = LOWER(forum_slug_param) LIMIT 1 LOOP
        n = forum_record.forum_id;
    END LOOP;
    RETURN n;
END;
$$ LANGUAGE plpgsql;

/**********************************************/

CREATE OR REPLACE FUNCTION find_forum_slug(forum_number INTEGER) RETURNS TEXT AS $$
    DECLARE forum_record RECORD;
    DECLARE s TEXT;
BEGIN
    s = 'FORUM_SLUG_NOT_FOUND';
    FOR forum_record IN SELECT forum_slug, forum_id FROM forum WHERE forum_id = forum_number LIMIT 1 LOOP
        s = forum_record.forum_slug;
    END LOOP;
    RETURN s;
END;
$$ LANGUAGE plpgsql;

/**********************************************/

CREATE OR REPLACE FUNCTION find_forum_information(forum_slug_param TEXT) RETURNS TEXT AS $$
    DECLARE forum_record forum_type;
    DECLARE forum_exists BOOLEAN;
    DECLARE forum_answer forum_type;
BEGIN
    forum_exists = False;
    FOR forum_record IN SELECT * FROM forum WHERE LOWER(forum_slug) = LOWER(forum_slug_param) LIMIT 1 LOOP
        forum_exists = True;
        forum_answer = forum_record;
    END LOOP;
    IF(forum_exists = False) THEN
        RETURN 'FORUM_NOT_FOUND';
    END IF;
    RETURN to_json(forum_answer);
END;
$$ LANGUAGE plpgsql;

/**********************************************/

CREATE OR REPLACE FUNCTION create_new_pair(student_id_param INTEGER, forum_id_param INTEGER) RETURNS TEXT AS $$
    DECLARE pair_exists BOOLEAN;
    DECLARE pair_record RECORD;
BEGIN
    pair_exists = False;
    FOR pair_record IN SELECT pair_student_id, pair_forum_id FROM pair WHERE student_id_param = pair_student_id AND forum_id_param = pair_forum_id LIMIT 1 LOOP
        pair_exists = True;
    END LOOP;
    IF (pair_exists = False) THEN
        INSERT INTO pair (pair_student_id, pair_forum_id) VALUES (student_id_param, forum_id_param);
    END IF;
    RETURN 'PAIR';
END;
$$ LANGUAGE plpgsql;

/**********************************************/

CREATE OR REPLACE FUNCTION create_new_thread(nickname_param TEXT, created_param TIMESTAMPTZ, message_param TEXT, title_param TEXT, forum_slug_param TEXT, thread_slug_param TEXT, thread_id_param INTEGER) RETURNS TEXT AS $$
    DECLARE forum_number INTEGER;
    DECLARE student_number INTEGER;
    DECLARE thread_exists BOOLEAN;
    DECLARE thread_record thread_type;
    DECLARE thread_answer thread_type;
    DECLARE thread_array thread_type ARRAY;
    DECLARE xxx TEXT;
BEGIN
    forum_number = find_forum_id(forum_slug_param);
    IF(forum_number = -1) THEN
        RETURN 'FORUM_NOT_FOUND';
    END IF;
    student_number = find_student_number(nickname_param);
    IF(student_number = -1) THEN
        RETURN 'STUDENT_NOT_FOUND';
    END IF;
    thread_exists = False;
    FOR thread_record IN SELECT * FROM thread WHERE LOWER(thread_slug) = LOWER(thread_slug_param) LIMIT 1 LOOP
        thread_exists = True;
        thread_answer = thread_record;
    END LOOP;
    IF(thread_exists = True) THEN
        RETURN to_json(thread_answer);
    END IF;
    INSERT INTO thread (thread_id, thread_author_nickname, thread_author_id, thread_created, thread_forum_slug, thread_forum_id, thread_message,
    thread_slug, thread_title, thread_votes)
    VALUES (
        thread_id_param,
        find_student_login(student_number),
        student_number,
        created_param,
        find_forum_slug(forum_number),
        forum_number,
        message_param,
        thread_slug_param,
        title_param,
        0
    );
    FOR thread_record IN SELECT * FROM thread WHERE LOWER(thread_slug_param) = LOWER(thread_slug) LIMIT 1 LOOP
        thread_array[1] = thread_record;
    END LOOP;
    xxx = create_new_pair(student_number, forum_number);
    RETURN array_to_json(thread_array);
END;
$$ LANGUAGE plpgsql;

/**********************************************/

CREATE OR REPLACE FUNCTION find_thread_id(thread_slug_param TEXT) RETURNS INTEGER AS $$
    DECLARE n INTEGER;
    DECLARE thread_record RECORD;
BEGIN
    n = -1;
    FOR thread_record IN SELECT thread_slug, thread_id FROM thread WHERE LOWER(thread_slug) = LOWER(thread_slug_param) LIMIT 1 LOOP
        n = thread_record.thread_id;
    END LOOP;
    RETURN n;
END;
$$ LANGUAGE plpgsql;

/**********************************************/

CREATE OR REPLACE FUNCTION find_thread_slug(thread_id_param INTEGER) RETURNS TEXT AS $$
    DECLARE s TEXT;
    DECLARE thread_record RECORD;
BEGIN
    s = 'THREAD_SLUG_NOT_FOUND';
    FOR thread_record IN SELECT thread_slug, thread_id FROM thread WHERE thread_id_param = thread_id LIMIT 1 LOOP
        s = thread_record.thread_slug;
    END LOOP;
    RETURN s;
END;
$$ LANGUAGE plpgsql;

/**********************************************/

CREATE OR REPLACE FUNCTION is_parent_exists (parent_number INTEGER, thread_number INTEGER) RETURNS TEXT AS $$
    DECLARE post_record RECORD;
    DECLARE answer TEXT;
BEGIN
    answer = 'NO';
    IF (parent_number = 0) THEN
        answer = 'YES';
    END IF;
    FOR post_record IN SELECT post_id, post_thread_id FROM post WHERE post_id = parent_number AND post_thread_id = thread_number LIMIT 1 LOOP
        answer = 'YES';
    END LOOP;
    RETURN answer;
END;
$$ LANGUAGE plpgsql;

/**********************************************/

CREATE OR REPLACE FUNCTION get_list_of_parents (arr INTEGER ARRAY) RETURNS TEXT AS $$
    DECLARE n INTEGER;
    DECLARE i INTEGER;
    DECLARE parent_id INTEGER;
    DECLARE result_array post_type ARRAY;
    DECLARE post_record post_type;
    DECLARE r INTEGER;
BEGIN
    n = array_length(arr, 1);
    r = 0;
    FOR i IN 1..n LOOP
        parent_id = arr[i];
        FOR post_record IN SELECT * FROM post WHERE post_id = parent_id LIMIT 1 LOOP
            r = r + 1;
            result_array[r] = post_record;
        END LOOP;
    END LOOP;
    IF (r = 0) THEN
        RETURN '[]';
    END IF;
    RETURN array_to_json(result_array);
END;
$$ LANGUAGE plpgsql;

/**********************************************/

CREATE OR REPLACE FUNCTION are_all_parents_exists (arr INTEGER ARRAY, thread_number INTEGER) RETURNS TEXT AS $$
    DECLARE answer TEXT;
    DECLARE i INTEGER;
    DECLARE n INTEGER;
    DECLARE s TEXT;
BEGIN
    answer = 'YES';
    n = array_length(arr, 1);
    FOR i IN 1..n LOOP
      s = is_parent_exists(arr[i], thread_number);
      IF (s = 'NO') THEN
        answer = 'NO';
      END IF;
    END LOOP;
    RETURN answer;
END;
$$ LANGUAGE plpgsql;

/**********************************************/

CREATE OR REPLACE FUNCTION are_all_students_exists(arr TEXT ARRAY) RETURNS TEXT AS $$
    DECLARE answer TEXT;
    DECLARE i INTEGER;
    DECLARE n INTEGER;
    DECLARE x INTEGER;
BEGIN
    answer = 'YES';
    n = array_length(arr, 1);
    FOR i IN 1..n LOOP
        x = find_student_number(arr[i]);
        IF(x = -1) THEN
            answer = 'NO';
        END IF;
    END LOOP;
    RETURN answer;
END;
$$ LANGUAGE plpgsql;

/**********************************************/

CREATE OR REPLACE FUNCTION create_new_vote(nickname_param TEXT, voice_param INTEGER, thread_number INTEGER) RETURNS TEXT AS $$
    DECLARE vote_exists BOOLEAN;
    DECLARE vote_record RECORD;
    DECLARE r RECORD;
    DECLARE summa INTEGER;
BEGIN
    vote_exists = False;
    FOR vote_record IN SELECT vote_nickname, vote_voice, vote_thread_id FROM vote WHERE LOWER(vote_nickname) = LOWER(nickname_param) AND thread_number = vote_thread_id LIMIT 1 LOOP
        vote_exists = True;
    END LOOP;
    IF (vote_exists = False) THEN
        INSERT INTO vote (vote_nickname, vote_voice, vote_thread_id) VALUES (nickname_param, voice_param, thread_number);
    END IF;
    IF (vote_exists = True) THEN
        UPDATE vote SET vote_voice = voice_param WHERE LOWER(vote_nickname) = LOWER(nickname_param) AND thread_number = vote_thread_id;
    END IF;
    summa = 0;
    FOR r IN SELECT SUM(vote_voice) FROM vote WHERE thread_number = vote_thread_id LOOP
        summa = r.sum;
    END LOOP;
    UPDATE thread SET thread_votes = summa WHERE thread_number = thread_id;
    RETURN 'VOTE_OK';
END;
$$ LANGUAGE plpgsql;

/**********************************************/

CREATE OR REPLACE FUNCTION update_message_information_of_thread(thread_number INTEGER, message_param TEXT) RETURNS TEXT AS $$
BEGIN
    IF (message_param != '@@@_NOT_CHANGE') THEN
        UPDATE thread SET thread_message = message_param WHERE thread_id = thread_number;
    END IF;
    RETURN 'OK';
END;
$$ LANGUAGE plpgsql;

/**********************************************/

CREATE OR REPLACE FUNCTION update_title_information_of_thread(thread_number INTEGER, title_param TEXT) RETURNS TEXT AS $$
BEGIN
    IF (title_param != '@@@_NOT_CHANGE') THEN
        UPDATE thread SET thread_title = title_param WHERE thread_id = thread_number;
    END IF;
    RETURN 'OK';
END;
$$ LANGUAGE plpgsql;

/**********************************************/

CREATE OR REPLACE FUNCTION update_one_thread_inf(thread_number INTEGER, message_param TEXT, title_param TEXT) RETURNS TEXT AS $$
    DECLARE s TEXT;
    DECLARE thread_record thread_type;
    DECLARE answer_string TEXT;
BEGIN
    s = update_message_information_of_thread(thread_number, message_param);
    s = update_title_information_of_thread(thread_number, title_param);
    answer_string = '{}';
    FOR thread_record IN SELECT * FROM thread WHERE thread_id = thread_number LIMIT 1 LOOP
        answer_string = to_json(thread_record);
    END LOOP;
    RETURN answer_string;
END;
$$ LANGUAGE plpgsql;

/**********************************************/

CREATE OR REPLACE FUNCTION inc_number_of_threads_in_forum(forum_slug_param TEXT) RETURNS TEXT AS $$
BEGIN
    UPDATE forum SET forum_threads = forum_threads + 1 WHERE LOWER(forum_slug) = LOWER(forum_slug_param);
    RETURN 'OK';
END;
$$ LANGUAGE plpgsql;

/**********************************************/

CREATE OR REPLACE FUNCTION inc_number_of_posts_in_forum(forum_id_param INTEGER) RETURNS TEXT AS $$
BEGIN
    UPDATE forum SET forum_posts = forum_posts + 1 WHERE forum_id = forum_id_param;
    RETURN 'OK';
END;
$$ LANGUAGE plpgsql;

/**********************************************/

