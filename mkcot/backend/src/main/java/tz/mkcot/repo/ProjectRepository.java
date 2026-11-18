package tz.mkcot.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tz.mkcot.model.Project;

public interface ProjectRepository extends JpaRepository<Project, String> {
}
