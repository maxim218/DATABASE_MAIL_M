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
